export interface BlogPost {
    title: string;
    slug: string;
    date: string;
    author: string;
    excerpt: string;
    content: string;
    category: string;
    keywords: string[];
}

export const blogPosts: BlogPost[] = [
    {
        title: "Official LBS MCA 2026 Overview: Dates, Eligibility & Application Roadmap",
        slug: "lbs-mca-2026-overview-dates-eligibility",
        date: "April 20, 2026",
        author: "ASCA",
        category: "General",
        keywords: ["LBS MCA 2026", "Kerala MCA entrance", "MCA eligibility", "LBS registration"],
        excerpt: "Discover everything you need to know about the Kerala LBS MCA Entrance Examination 2026. From eligibility criteria to key dates and application procedures.",
        content: `
            <p>The LBS Centre for Science and Technology is preparing to conduct the Kerala state-level MCA Entrance Examination for admission to the academic year 2026. This examination is the gateway for students aspiring to join prestigious MCA programmes across various institutions in Kerala.</p>
            
            <h3>Key Dates (Expected)</h3>
            <ul>
                <li><strong>Application Commencement:</strong> May - June 2026</li>
                <li><strong>Examination Date:</strong> July - August 2026</li>
                <li><strong>Result Declaration:</strong> Within 15 days of the exam</li>
            </ul>

            <h3>Eligibility Criteria</h3>
            <p>Candidates must ensure they meet the following primary requirements before applying:</p>
            <ul>
                <li><strong>Citizenship:</strong> Must be an Indian citizen (Kerala nativity preferred for certain quotas).</li>
                <li><strong>Educational Qualification:</strong> Must have passed a three-year Degree course with Mathematics or Statistics at the 10+2 level or as a main/subsidiary subject at the graduation level.</li>
                <li><strong>Minimum Marks:</strong> Typically 50% marks in the qualifying examination (relaxation for reserved categories).</li>
            </ul>

            <p>Stay tuned to our platform for official notifications and a step-by-step registration guide as soon as the portal opens.</p>
        `
    },
    {
        title: "Ultimate LBS MCA Syllabus Breakdown: Subject-Wise Focus Areas",
        slug: "lbs-mca-syllabus-breakdown-2026",
        date: "April 19, 2026",
        author: "ASCA",
        category: "Preparation",
        keywords: ["LBS MCA syllabus", "MCA entrance topics", "Computer Science MCQs", "Maths for MCA"],
        excerpt: "Master the LBS MCA Entrance syllabus with our detailed subject-wise breakdown. Focus on Computer Science, Mathematics, Aptitude, and English to secure a top rank.",
        content: `
            <p>Success in the LBS MCA Entrance Examination requires a deep understanding of the syllabus. The exam consists of 120 multiple-choice questions to be completed in 2 hours. Here is the detailed breakdown of the weightage and core topics.</p>

            <h3>1. Computer Science (50 Questions)</h3>
            <p>This is the most critical section. Focus areas include:</p>
            <ul>
                <li><strong>Digital Fundamentals:</strong> Boolean Algebra, Truth Tables, and Gates.</li>
                <li><strong>Computer Architecture:</strong> CPU structure, I/O devices, and interrupts.</li>
                <li><strong>Data Representation:</strong> Binary, Hexadecimal, and Floating-point arithmetic.</li>
                <li><strong>Programming:</strong> C-language fundamentals and logic-based problem solving.</li>
            </ul>

            <h3>2. Mathematics & Statistics (25 Questions)</h3>
            <ul>
                <li><strong>Algebra:</strong> Quadratic equations, Logarithms, and Progressions (AP/GP).</li>
                <li><strong>Coordinate Geometry:</strong> Lines, Circles, and Parabola.</li>
                <li><strong>Mensuration:</strong> Surface areas and volumes of spheres, cylinders, and cones.</li>
            </ul>

            <h3>3. Quantitative Aptitude & Logical Ability (25 Questions)</h3>
            <p>Includes reasoning based on factual passages and quick numerical ability tests.</p>

            <h3>4. General English (15 Questions)</h3>
            <p>Grammar, vocabulary, and comprehension are tested here.</p>
        `
    },
    {
        title: "Direct Preparation Strategy: Mock Tests & Rank Tracking",
        slug: "lbs-mca-preparation-strategy-mock-tests",
        date: "April 18, 2026",
        author: "ASCA",
        category: "Strategy",
        keywords: ["MCA rank tracking", "LBS mock tests", "exam strategy", "mca entrance tips"],
        excerpt: "How do you transition from student to rank-holder? Learn the strategy of simulated environments, rank tracking, and interval-based revisions.",
        content: `
            <p>With thousands of students competing for limited seats in government and top private colleges, a generic study plan isn't enough. You need a data-driven strategy.</p>

            <h3>The Power of Simulated Environments</h3>
            <p>Taking a mock test isn't just about answering questions; it's about managing time. Our platform provides full-length mock tests that replicate the 120-question, 2-hour format of the actual LBS exam.</p>

            <h3>Why Rank Tracking Matters</h3>
            <p>Knowing your score is good, but knowing where you stand among peers is better. Our National Rank Tracking system lets you compare your results with hundreds of other LBS aspirants, highlighting your standing in sectors like Computer Science or Mathematics.</p>

            <h3>The 'ASCA' Method</h3>
            <p><strong>Assessment:</strong> Identify weak spots through subject-wise quizzes.<br>
            <strong>Standardization:</strong> Follow the official LBS pattern strictly.<br>
            <strong>Correction:</strong> Review every wrong answer and understand the fundamental logic.<br>
            <strong>Acceleration:</strong> Improve speed by solving previous year papers daily.</p>
        `
    }
];
