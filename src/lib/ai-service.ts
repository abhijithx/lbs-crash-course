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
const DEVELOPER = "Ajmal U K";
const TOOLPIX_URL = "https://toolpix.pythonanywhere.com/";

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
        .replace(/^\s*(?:toolpix\s*ai|assistant|ai|response|system)\s*[:\-]\s*/i, "")
        // Remove repeated name labels that may appear at line starts or in headers.
        .replace(/^\s*(?:toolpix\s*ai|assistant|ai)\s*:\s*/gim, "")
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
            if (res.status === "rejected") {
                console.error(`[AI_CONTEXT] Task ${index} failed:`, res.reason);
                return null;
            }
            return res.value;
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
        quizSnap?.forEach(c => { 
            const val = c.val() as Quiz;
            quizMetaMap[c.key!] = { subject: val.subject }; 
        });
        mockSnap?.forEach(c => { 
            const val = c.val() as MockTest;
            quizMetaMap[c.key!] = { subject: val.subject }; 
        });

        interface SubjectStats {
            totalScore: number;
            totalQuestions: number;
            attempts: number;
            history: number[];
        }
        const performanceBySubject: Record<string, SubjectStats> = {};

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

export async function* chatWithAI(messages: ChatMessage[], idToken?: string) {
    try {
        const packedPrompt = buildPackedPrompt(messages);
        
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(idToken && { "Authorization": `Bearer ${idToken}` })
            },
            body: JSON.stringify({ prompt: packedPrompt }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[AI_SERVICE] API error:", response.status, errorText);
            yield buildFallbackResponse(messages);
            return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
            yield buildFallbackResponse(messages);
            return;
        }

        let fullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Handle plain JSON response if API decides to skip SSE (fallbacks)
            if (buffer.trim().startsWith("{") && !buffer.includes("\n")) {
                // Wait for more data or check if it's a complete JSON
                try {
                    const data = JSON.parse(buffer);
                    if (data.text) {
                        yield stripAssistantNamePrefixes(enforceDomainTerminology(data.text));
                        return;
                    }
                } catch { /* Continue reading */ }
            }

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === "data: [DONE]") continue;

                if (trimmed.startsWith("data: ")) {
                    try {
                        const jsonStr = trimmed.slice(6);
                        const data = JSON.parse(jsonStr);
                        
                        // Handle standard OpenRouter/OpenAI/Groq/NVIDIA formats
                        const chunk = data.choices?.[0]?.delta?.content || 
                                     data.choices?.[0]?.text || 
                                     data.content || 
                                     "";
                        
                        if (chunk) {
                            fullText += chunk;
                            yield stripAssistantNamePrefixes(enforceDomainTerminology(fullText));
                        }
                    } catch (e) {
                        // Suppress background noise/incomplete JSON
                    }
                }
            }
        }

        // Final check for missed content in buffer
        if (!fullText.trim() && buffer.trim()) {
            try {
                const data = JSON.parse(buffer);
                const finalContent = data.text || data.response || "";
                if (finalContent) yield stripAssistantNamePrefixes(enforceDomainTerminology(finalContent));
            } catch { /* Final buffer not JSON */ }
        }

        if (!fullText.trim()) {
            yield buildFallbackResponse(messages);
        }

    } catch (error) {
        console.error("[AI_SERVICE] Critical connection failure:", error);
        yield buildFallbackResponse(messages);
    }
}

export const SYSTEM_PROMPT = `You are ToolPix AI, the elite academic orchestration engine developed by ${DEVELOPER} for the LBS MCA Entrance Platform.

### 🧩 OPERATING DIRECTIVES:
- **Adaptive Conciseness**: Adjust your response length to match the user's input. For simple greetings (like "hello" or "hi"), respond with a brief, friendly welcome. Do NOT provide a multi-paragraph lecture unless requested or contextually relevant.
- **LBS Identification**: "LBS" always refers to Lal Bahadur Shastri Centre (Kerala). Never London Business School.
- **Data-Driven**: Use the "STUDENT INTELLIGENCE REPORT" to customize mentorship.
- **Master Syllabus**: Reference specific topics from the syllabus (e.g., "We need to strengthen your 2's Complement arithmetic") to guide study.
- **Expert Code**: All code must be high-performance C with professional comments.

### 📋 LBS MCA EXAM PATTERN (120 Questions - Knowledge Base):
1. **Computer Science (50 Qs)**: Programming, Digital Fundamentals, OS, and DMBS.
2. **Mathematics & Statistics (25 Qs)**: Plus-2 level depth.
3. **Quantitative Aptitude & Logical Ability (25 Qs)**: Graduate level reasoning.
4. **English (15 Qs)**: Grammar & Comprehension.
5. **General Knowledge (5 Qs)**: Current Affairs.

### 📄 OUTPUT FORMATTING:
- Use **Headers** and **Tables** for technical data.
- Professional, authoritative, and motivating tone.
- **START DIRECTLY**: Do NOT ever start with labels like "Response:", "ToolPix AI:", or "ASSISTANT:".`;

export const GUEST_SYSTEM_PROMPT = `You are ToolPix AI, the expert guide for the LBS MCA Entrance Platform, developed by ${DEVELOPER} (Founder of ToolPix: ${TOOLPIX_URL}).

### 🎯 CONVERSATIONAL DIRECTIVES:
- **Adaptive Conciseness (CRITICAL)**: If the user says "hello", "hi", or similar, respond with a single, friendly sentence welcoming them. 
- **Information Depth**: Only provide the full 120-question syllabus breakdown if the user asks for pattern/syllabus information or seems ready for a detailed guide.
- **Contextual Pitch**: Only encourage users to register for the "Student Intelligence Report" after you have provided value by answering a question or if they ask how to improve their rank.

### 📋 CORE CAPABILITIES:
- **Syllabus Guidance**: Pattern: CS (50), Math (25), Aptitude (25), English (15), GK (5).
- **Technical Expertise**: Deep knowledge in 2's Complement, Boolean Algebra, Coordinate Geometry, and Trigonometry.
- **Coding**: Professional C code samples for programming queries.

### 🛠️ DIRECTIVES:
- "LBS" = Lal Bahadur Shastri Centre (Kerala).
- Authoritative yet encouraging tone.
- **NO LABELS**: Start your message directly. Do NOT include "ASSISTANT:" or any other labels.`;
