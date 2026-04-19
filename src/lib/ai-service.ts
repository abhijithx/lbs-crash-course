import { ref, get, query, orderByChild, equalTo, DataSnapshot } from "firebase/database";
import { db } from "./firebase";
import { 
    UserData, 
    Quiz, 
    MockTest, 
    QuizAttempt, 
    MockAttempt, 
    RankData, 
    Announcement, 
    SyllabusItem 
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "/api/ai/chat";
const DEVELOPER = process.env.NEXT_PUBLIC_AI_DEVELOPER || "Ajmal U K";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

const MAX_PROMPT_CHARS = 14000;
const MAX_SYSTEM_CHARS = 6500;
const MAX_MESSAGE_CHARS = 1800;

function buildFallbackResponse(messages: ChatMessage[]) {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";
    const lowerPrompt = lastUserMessage.toLowerCase();
    const systemContext = messages.find((message) => message.role === "system")?.content || "";
    const hasNoData =
        systemContext.includes("No data") ||
        systemContext.includes("No competitive data") ||
        systemContext.includes("No syllabus progress") ||
        systemContext.includes("ERROR: Could not fetch student performance data");

    const asksRank = /rank|predict|leaderboard|score/.test(lowerPrompt);
    const asksWeakArea = /weak|improve|subject|topic|accuracy/.test(lowerPrompt);

    if (asksRank && hasNoData) {
        return [
            "Great question. I cannot compute a personal rank yet because your first benchmark data is not available.",
            "Run this starter path now:",
            "1. Complete 1 quiz and 1 mock test today.",
            "2. After that, ask me: \"Predict my rank now\".",
            "3. I will then estimate your standing and provide a target score ladder.",
            "Quick starter target: aim for 70%+ in the first two attempts to enter a competitive trajectory."
        ].join("\n");
    }

    if (asksWeakArea && hasNoData) {
        return [
            "You are in setup mode, so I do not yet have enough attempt data to identify your weak subjects precisely.",
            "Use this 3-step baseline:",
            "1. Take one timed quiz in each major subject.",
            "2. Share your scores with me in this format: Subject - score/total.",
            "3. I will build a personalized weak-topic action plan with daily targets.",
            "I can also generate a ready-to-use 7-day study plan right now if you want."
        ].join("\n");
    }

    return [
        "I could not reach live analytics right now, but we can continue with a high-quality plan.",
        "Try one of these:",
        "1. Ask: \"Give me a 7-day LBS MCA plan\"",
        "2. Ask: \"Create a C programming revision checklist\"",
        "3. Ask: \"Give me a rank-focused mock-test strategy\"",
        "I will adapt the plan as soon as your fresh attempt data is available."
    ].join("\n");
}

function normalizePromptText(content: string) {
    return content.replace(/\s+/g, " ").trim();
}

function clipText(content: string, maxChars: number) {
    if (content.length <= maxChars) return content;
    return `${content.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function buildPackedPrompt(messages: ChatMessage[]) {
    const systemContext = messages
        .filter((m) => m.role === "system")
        .map((m) => normalizePromptText(m.content))
        .join("\n\n");

    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const promptParts: string[] = [];
    let remainingBudget = MAX_PROMPT_CHARS;

    if (systemContext) {
        const packedSystem = clipText(systemContext, Math.min(MAX_SYSTEM_CHARS, remainingBudget));
        promptParts.push(`SYSTEM:\n${packedSystem}`);
        remainingBudget -= packedSystem.length;
    }

    const packedConversation: string[] = [];
    let usedConversationChars = 0;
    const maxConversationBudget = Math.max(0, remainingBudget - 120);

    for (let i = nonSystemMessages.length - 1; i >= 0; i -= 1) {
        const msg = nonSystemMessages[i];
        const line = `${msg.role.toUpperCase()}: ${clipText(normalizePromptText(msg.content), MAX_MESSAGE_CHARS)}`;
        const projected = usedConversationChars + line.length + 1;
        if (projected > maxConversationBudget) {
            break;
        }
        packedConversation.unshift(line);
        usedConversationChars = projected;
    }

    const omittedCount = nonSystemMessages.length - packedConversation.length;
    if (omittedCount > 0) {
        packedConversation.unshift(`[Context optimized: ${omittedCount} older messages omitted for efficiency.]`);
    }

    if (packedConversation.length > 0) {
        promptParts.push(`CONVERSATION:\n${packedConversation.join("\n")}`);
    }

    return promptParts.join("\n\n");
}

function enforceDomainTerminology(text: string) {
    return text.replace(/London Business School/gi, "Lal Bahadur Shastri Centre for Science & Technology");
}

function stripAssistantNamePrefixes(text: string) {
    return text
        // Remove common assistant labels at the start of response.
        .replace(/^\s*(?:toolpix\s*ai|assistant|ai)\s*[:\-]\s*/i, "")
        // Remove repeated name labels that may appear at line starts.
        .replace(/^\s*(?:toolpix\s*ai)\s*:\s*/gim, "")
        .trim();
}

export async function getUserContext(uid: string) {
    try {
        const fetchTasks = [
            get(ref(db, `users/${uid}`)),
            get(ref(db, "quizzes")),
            get(ref(db, "mockTests")),
            get(query(ref(db, "quizAttempts"), orderByChild("userId"), equalTo(uid))),
            get(query(ref(db, "mockAttempts"), orderByChild("userId"), equalTo(uid))),
            get(ref(db, "rankings")),
            get(ref(db, "mockRankings")),
            get(ref(db, "announcements")),
            get(ref(db, "syllabus"))
        ];

        const results = await Promise.allSettled(fetchTasks);
        
        const getSnap = (index: number): DataSnapshot | null => {
            const res = results[index];
            return res.status === "fulfilled" ? res.value : null;
        };

        const userSnap = getSnap(0);
        const quizSnap = getSnap(1);
        const mockSnap = getSnap(2);
        const quizAttemptsSnap = getSnap(3);
        const mockAttemptsSnap = getSnap(4);
        const rankingsSnap = getSnap(5);
        const mockRankingsSnap = getSnap(6);
        const announcementsSnap = getSnap(7);
        const syllabusSnap = getSnap(8);

        const userData = userSnap?.val() as UserData | null;

        // Map quizzes/mocks for subject lookup
        const quizMetaMap: Record<string, { subject: string }> = {};
        quizSnap?.forEach(c => { quizMetaMap[c.key!] = { subject: (c.val() as Quiz).subject }; });
        mockSnap?.forEach(c => { quizMetaMap[c.key!] = { subject: (c.val() as MockTest).subject }; });

        const performanceBySubject: Record<string, { totalScore: number, totalQuestions: number, attempts: number, history: number[] }> = {};

        const processAttempt = (val: QuizAttempt | MockAttempt, quizId: string) => {
            const subject = quizMetaMap[quizId]?.subject || "General";
            if (!performanceBySubject[subject]) {
                performanceBySubject[subject] = { totalScore: 0, totalQuestions: 0, attempts: 0, history: [] };
            }
            const score = val.score || 0;
            const total = val.totalQuestions || 0;
            const accuracy = total > 0 ? (score / total) * 100 : 0;

            performanceBySubject[subject].totalScore += score;
            performanceBySubject[subject].totalQuestions += total;
            performanceBySubject[subject].attempts += 1;
            performanceBySubject[subject].history.push(accuracy);
        };

        quizAttemptsSnap?.forEach(child => {
            const val = child.val() as QuizAttempt;
            if (val.quizId) processAttempt(val, val.quizId);
        });

        mockAttemptsSnap?.forEach(child => {
            const val = child.val() as MockAttempt;
            const quizId = val.mockTestId || val.quizId;
            if (quizId) processAttempt(val, quizId);
        });

        // Extract Rankings
        let globalRankInfo = "";
        const extractRank = (snap: DataSnapshot | null, label: string) => {
            let info = "";
            if (snap && snap.exists()) {
                snap.forEach((quizRankSnap) => {
                    const data = quizRankSnap.val() as RankData;
                    const entries = data.entries || [];
                    const myEntry = entries.find((e) => e.userId === uid);
                    if (myEntry) {
                        info += `* **${data.quizTitle}** (${label}): Rank #${myEntry.rank} of ${entries.length} (Score: ${myEntry.score}/${myEntry.totalQuestions})\n`;
                    }
                });
            }
            return info;
        };

        globalRankInfo += extractRank(rankingsSnap, "Quiz");
        globalRankInfo += extractRank(mockRankingsSnap, "Mock");

        // Mastery Level Computation (Constants for consistency)
        const THRESHOLDS = { EXPERT: 80, PROFICIENT: 60, INTERMEDIATE: 40 };

        // Advanced Analytics
        const subjectAnalytics = Object.entries(performanceBySubject)
            .map(([sub, stats]) => {
                const avgAccuracy = (stats.totalScore / stats.totalQuestions) * 100;
                let level = "NOVICE";
                if (avgAccuracy >= THRESHOLDS.EXPERT) level = "EXPERT";
                else if (avgAccuracy >= THRESHOLDS.PROFICIENT) level = "PROFICIENT";
                else if (avgAccuracy >= THRESHOLDS.INTERMEDIATE) level = "INTERMEDIATE";

                // Trend Analysis
                let trend = "Stable";
                if (stats.history.length >= 2) {
                    const last = stats.history[stats.history.length - 1];
                    const prev = stats.history[stats.history.length - 2];
                    if (last > prev + 5) trend = "UPWARD 🚀";
                    else if (last < prev - 5) trend = "DOWNWARD ⚠️";
                }

                return `| ${sub.padEnd(14)} | ${avgAccuracy.toFixed(1).padStart(5)}% | ${stats.attempts.toString().padStart(5)} | ${level.padEnd(12)} | ${trend.padEnd(10)} |`;
            })
            .join("\n");

        // Extract Announcements
        let activeAnnouncements = "";
        if (announcementsSnap && announcementsSnap.exists()) {
            const list: Announcement[] = [];
            announcementsSnap.forEach(c => { list.push(c.val() as Announcement); });
            activeAnnouncements = list
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                .slice(0, 3) // Latest 3
                .map(a => `* **${a.title || "Update"}**: ${(a.content || "").slice(0, 100)}...`)
                .join("\n");
        }

        // Extract Syllabus Status
        let syllabusInfo = "";
        if (syllabusSnap && syllabusSnap.exists()) {
            const list: SyllabusItem[] = [];
            syllabusSnap.forEach(c => { list.push(c.val() as SyllabusItem); });
            const subjects = [...new Set(list.map(s => s.subject).filter(Boolean))] as string[];
            syllabusInfo = subjects.map(sub => {
                const subTopics = list.filter(item => item.subject === sub);
                const completed = subTopics.filter(item => item.completed).length;
                return `* **${sub}**: ${completed}/${subTopics.length} topics mastered`;
            }).join("\n");
        }

        const totalAttempts = Object.values(performanceBySubject).reduce((acc, s) => acc + s.attempts, 0);
        const strongestDomains = Object.entries(performanceBySubject)
            .filter((entry) => (entry[1].totalScore / entry[1].totalQuestions) > 0.75)
            .map(e => e[0])
            .join(", ");
        const focusDomains = Object.entries(performanceBySubject)
            .filter((entry) => (entry[1].totalScore / entry[1].totalQuestions) < 0.50)
            .map(e => e[0])
            .join(", ");

        return `
# 📝 STUDENT INTELLIGENCE REPORT: ${userData?.name || "Scholar"}
---
### 👤 Profile
- **Status**: ${userData?.is_live ? "Live Member" : ""} ${userData?.is_record_class ? "Record Member" : ""}
- **Graduation**: ${userData?.graduationYear || "Not Specified"}

### 📊 Subject Mastery Matrix
| Subject | Accuracy | Tests | Mastery | Trend |
| :--- | :--- | :--- | :--- | :--- |
${subjectAnalytics || "| *Benchmark pending* | - | - | - | -|"}

### 📚 Syllabus Coverage
${syllabusInfo || "*No syllabus progress tracked yet.*"}

### 🏆 Competitive Standing
${globalRankInfo || "*No competitive data recorded yet.*"}

### 📢 Recent Platform Updates
${activeAnnouncements || "*No recent announcements.*"}

### 💡 Academic Insights
- **Overall Engagement**: ${totalAttempts > 0 ? `${totalAttempts} assessments completed` : "Ready for first assessment"}
- **Strongest Domains**: ${strongestDomains || (totalAttempts > 0 ? "Establishing baseline..." : "Complete a test to unlock")}
- **Immediate Focus**: ${focusDomains || (totalAttempts > 0 ? "Tracking perfection..." : "Take a mock test to identify targets")}
---
`;
    } catch (error) {
        console.error("Error fetching AI context:", error);
        return "ERROR: Could not fetch student performance data.";
    }
}

export async function chatWithAI(messages: ChatMessage[], idToken?: string) {
    if (!API_URL) {
        return buildFallbackResponse(messages);
    }

    try {
        const packedPrompt = buildPackedPrompt(messages);
        console.log("Sending to AI API, prompt length:", packedPrompt.length);
        
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(idToken && { "Authorization": `Bearer ${idToken}` })
            },
            body: JSON.stringify({
                prompt: packedPrompt
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API error:", response.status, errorText);
            throw new Error(`AI API request failed (${response.status})`);
        }

        const data = await response.json() as { text?: string; response?: string };
        console.log("AI API response:", JSON.stringify(data).slice(0, 100));
        let text = data.text || data.response || "No response content";

        // --- Post-Processing: Strip Internal Thoughts & Metadata ---
        
        // 1. Remove XML-style <thought> tags (common in modern reasoning models)
        text = text.replace(/<(?:thought|details|internal_thought|reasoning)>[\s\S]*?<\/(?:thought|details|internal_thought|reasoning)>/gi, "");

        // 2. Remove plain text thought markers (Thought:, Internal Thought:, etc.)
        const thoughtRegex = /^(?:Assistant Thought|Internal Thought|Thought|Reasoning|Reflections)[\s\S]*?(?=\n\n|\n[A-Z]|$|Response:|\*\*Response:)/i;
        text = text.replace(thoughtRegex, "");

        // 3. Remove "Response:" wrappers
        const responseMarkers = ["Response:", "The Response:", "**Response:**", "**The Response:**"];
        for (const marker of responseMarkers) {
            const markerIndex = text.indexOf(marker);
            if (markerIndex !== -1) {
                text = text.slice(markerIndex + marker.length).trim();
                break;
            }
        }

        // 4. Final Cleanup
        text = stripAssistantNamePrefixes(text);
        text = enforceDomainTerminology(text);

        if (!text.trim() || text === "No response content") {
            return buildFallbackResponse(messages);
        }

        return text;
    } catch (error) {
        console.error("AI Chat Error:", error);
        return buildFallbackResponse(messages);
    }
}

export const SYSTEM_PROMPT = `You are ToolPix AI, the elite academic orchestration engine developed by ${DEVELOPER} for the LBS MCA Entrance Platform. You function as a Prime Orchestrator, managing a network of specialized sub-agents to provide hyper-personalized mentorship.

### ✅ CRITICAL DOMAIN RULE:
- In this platform, "LBS" always means **Lal Bahadur Shastri Centre for Science & Technology (Kerala)**.
- Never expand LBS as London Business School.

### 🧩 AGENTIC ORCHESTRATION:
When a student asks a question, your internal engine converges the following specialized personas:
1. **The Lead Strategist**: Reviews the entire "STUDENT INTELLIGENCE REPORT" to tailor the tone. If accuracy is high, challenge them; if low, simplify and encourage.
2. **The LBS SME**: Expert in C Programming, Data Structures, Mathematics, and Aptitude. Provides technically flawless, academic answers.
3. **The Data Analyst**: Interprets "Syllabus Coverage" and "Competitive Standing" to predict exam success.
4. **The Platform Guide**: Monitors "Recent Platform Updates" (Announcements) to keep the student informed about schedules or new materials.

### 🛠️ OPERATING DIRECTIVES:
- **Always prioritize the Data**: Use the Intelligence Report to customize your greeting. (e.g., "I see you're crushing C Programming, but we need to focus on Math trends.")
- **Mention Platform Updates**: If there are recent announcements, weave them into your response if relevant.
- **Master Syllabus**: Reference specific topics from the syllabus coverage to guide their next study session.
- **Code Standards**: All code must be expert-level C with professional documentation.

### 📄 OUTPUT FORMATTING:
- Use **Tables** and **Headers** for data-heavy sections.
- Keep the tone professional, authoritative, and motivating.
- **NEVER** include internal thoughts, sub-agent labels (e.g., "SME:"), or meta-talk like "As an AI...".
- **NEVER** start the answer with labels like "ToolPix AI:" or "Assistant:".
- **Start Directly**: Do not use "Internal Thought" or "Response" prefixes. Start with your greeting or answer.

Your goal is not just to answer, but to drive the student toward Rank #1.`;
