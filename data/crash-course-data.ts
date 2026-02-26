export type Video = {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: string
  order: number
}

export type Course = {
  id: string
  title: string
  description: string
  icon: string
  color: string
  videos: Video[]
}

export const crashCourseData: Course[] = [
  // Quantitative Aptitude
 {
    id: "apt",
    title: "Quantitative Aptitude",
    description: "Master aptitude topics essential for placement tests and competitive exams.",
    icon: "Calculator",
    color: "bg-green-500",
    videos: [
      {
        id: "apt-perc-1",
        title: "Percentage Part 1 – Malayalam (PSC/SSC Shortcuts)",
        description: "Shortcuts to solve percentage problems for PSC, SSC, and other competitive exams. (Malayalam, Trig Turn)",
        youtubeId: "tv-slrn6kLc",
        duration: "20:00",
        order: 1,
      },
      {
        id: "apt-perc-2",
        title: "Percentage Part 2 – Malayalam (PSC/SSC Shortcuts)",
        description: "Shortcuts to solve percentage problems, Part 2. (Malayalam, Trig Turn)",
        youtubeId: "8-Z2f5_EZ9E",
        duration: "25:00",
        order: 2,
      },
      {
        id: "apt-perc-3",
        title: "Percentage Tricks Part 3 (Shortcuts Without Pen & Paper)",
        description: "Mental math tips for calculating percentage in seconds (Malayalam, Trig Turn)",
        youtubeId: "44Zqu8U_a9w",
        duration: "25:00",
        order: 3,
      },
      {
        id: "apt-perc-4",
        title: "Percentage Part 4 – More Fast Percentage Shortcuts",
        description: "See percentage problems solved in seconds (Malayalam, Trig Turn)",
        youtubeId: "7O8hPNDWjrs",
        duration: "25:00",
        order: 4,
      },
      {
        id: "apt-perc-5",
        title: "Percentage Part 5 – Advanced Shortcuts & Tricks",
        description: "Tricks to learn percentage for SSC, PSC, RRB and degree level exams. (Malayalam, Trig Turn)",
        youtubeId: "vyCblhePu0o",
        duration: "30:00",
        order: 5,
      },
      {
        id: "apt-perc-6",
        title: "Percentage Part 6 – Complete All Shortcuts",
        description: "All percentage types in aptitude with fast solution tips (Malayalam, Trig Turn)",
        youtubeId: "qiPky0-KEfM",
        duration: "57:00",
        order: 6,
      },
      {
        id: "apt-perc-7",
        title: "Percentage Practice Marathon (PSC/SSC) – Part 7",
        description: "Long video with lots of practice percentage problems (Malayalam, Trig Turn)",
        youtubeId: "n5YYYCZ0iNQ",
        duration: "50:00",
        order: 7,
      },
      {
        id: "apt-perc-8",
        title: "Percentage Full Practice Set – Marathon Session",
        description: "Full-length practice session for competitive exams (Malayalam, Trig Turn)",
        youtubeId: "qPJLMJFL3n8",
        duration: "50:00",
        order: 8,
      },
      {
        id: "apt-perc-9",
        title: "Percentage Practice – Advanced PSC/SSC Session",
        description: "Final practice with new types, problems, and solutions (Malayalam, Trig Turn)",
        youtubeId: "eMjOFBtDsXw",
        duration: "55:00",
        order: 9,
      },
      // The previously existing videos (optionally, you can re-number them to 10, 11, 12..., or move to the end of the list!)
      {
        id: "apt-1",
        title: "Averages, Ratios & Percentages",
        description: "Covers average problems, ratio & proportion, and percentage calculations frequently asked in placement tests.",
        youtubeId: "XqT_Averages123",
        duration: "45:00",
        order: 10,
      },
      {
        id: "apt-2",
        title: "Time & Work, Time-Speed-Distance",
        description: "Learn shortcut methods for work-time and distance-speed-time questions for campus drives.",
        youtubeId: "XqT_TSDWork456",
        duration: "50:00",
        order: 11,
      },
      {
        id: "apt-3",
        title: "Profit, Loss & Interest",
        description: "Covers basic and advanced problems on profit & loss, simple and compound interest.",
        youtubeId: "XqT_PLInterest789",
        duration: "40:00",
        order: 12,
      },
    ],
  },

  // // Logical Reasoning
  // {
  //   id: "lg",
  //   title: "Logical Reasoning",
  //   description: "Sharpen reasoning skills like series, puzzles, coding-decoding, and pattern recognition.",
  //   icon: "Globe",
  //   color: "bg-blue-500",
  //   videos: [
  //     {
  //       id: "lg-1",
  //       title: "Number & Letter Series",
  //       description: "Techniques to crack number and letter series questions in logical reasoning sections.",
  //       youtubeId: "XqT_Series123",
  //       duration: "35:00",
  //       order: 1,
  //     },
  //     {
  //       id: "lg-2",
  //       title: "Puzzles, Blood Relations & Directions",
  //       description: "Practice common reasoning puzzles, blood relation problems, and direction sense questions.",
  //       youtubeId: "XqT_Puzzles456",
  //       duration: "50:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // English & Verbal Ability
  // {
  //   id: "eng",
  //   title: "English & Verbal Ability",
  //   description: "Improve grammar, vocabulary, and comprehension for placement verbal rounds.",
  //   icon: "BookOpen",
  //   color: "bg-green-500",
  //   videos: [
  //     {
  //       id: "eng-1",
  //       title: "Grammar & Error Detection",
  //       description: "Learn the rules of English grammar, error spotting, and correction techniques.",
  //       youtubeId: "XqT_Grammar123",
  //       duration: "40:00",
  //       order: 1,
  //     },
  //     {
  //       id: "eng-2",
  //       title: "Reading Comprehension & Vocabulary",
  //       description: "Enhance comprehension skills and master high-frequency placement vocabulary.",
  //       youtubeId: "XqT_RC456",
  //       duration: "45:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // Computer Networks
  // {
  //   id: "cn",
  //   title: "Computer Networks",
  //   description: "Understand fundamental networking concepts important for IT job interviews.",
  //   icon: "Network",
  //   color: "bg-blue-600",
  //   videos: [
  //     {
  //       id: "cn-1",
  //       title: "Basics of Computer Networks",
  //       description: "Covers OSI & TCP/IP models, types of networks, and basic protocols.",
  //       youtubeId: "XqT_CNBasics123",
  //       duration: "55:00",
  //       order: 1,
  //     },
  //     {
  //       id: "cn-2",
  //       title: "IP Addressing & Subnetting",
  //       description: "Explains IP addressing classes, subnet masks, and network calculations.",
  //       youtubeId: "XqT_Subnet456",
  //       duration: "40:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // Operating Systems
  // {
  //   id: "os",
  //   title: "Operating Systems",
  //   description: "Important OS concepts asked in technical rounds of software companies.",
  //   icon: "Server",
  //   color: "bg-blue-500",
  //   videos: [
  //     {
  //       id: "os-1",
  //       title: "Process Management & Scheduling",
  //       description: "Covers processes, threads, and CPU scheduling algorithms like FCFS, SJF, Round Robin.",
  //       youtubeId: "XqT_OSProcess123",
  //       duration: "50:00",
  //       order: 1,
  //     },
  //     {
  //       id: "os-2",
  //       title: "Memory Management & Deadlock",
  //       description: "Explains memory allocation, paging, segmentation, and deadlock conditions.",
  //       youtubeId: "XqT_OSMemory456",
  //       duration: "45:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // DBMS
  // {
  //   id: "dbms",
  //   title: "Database Management Systems",
  //   description: "Covers DBMS fundamentals typically asked in tech interviews.",
  //   icon: "Database",
  //   color: "bg-blue-500",
  //   videos: [
  //     {
  //       id: "dbms-1",
  //       title: "SQL Basics & Queries",
  //       description: "Learn SQL basics, SELECT queries, joins, subqueries, and aggregation functions.",
  //       youtubeId: "XqT_SQLBasics123",
  //       duration: "50:00",
  //       order: 1,
  //     },
  //     {
  //       id: "dbms-2",
  //       title: "Normalization & Transactions",
  //       description: "Explains normalization, anomalies, transaction properties, and concurrency control.",
  //       youtubeId: "XqT_Normalize456",
  //       duration: "45:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // Mathematics & Statistics
  // {
  //   id: "math",
  //   title: "Mathematics & Statistics",
  //   description: "Important math & statistics concepts for placement aptitude and data analysis roles.",
  //   icon: "Calculator",
  //   color: "bg-blue-500",
  //   videos: [
  //     {
  //       id: "math-1",
  //       title: "Algebra & Number Systems",
  //       description: "Covers basic algebra, HCF, LCM, factors, and number system conversions.",
  //       youtubeId: "XqT_Algebra123",
  //       duration: "45:00",
  //       order: 1,
  //     },
  //     {
  //       id: "math-2",
  //       title: "Probability & Statistics",
  //       description: "Introduction to probability, permutations, combinations, and basic statistical measures.",
  //       youtubeId: "XqT_ProbStats456",
  //       duration: "50:00",
  //       order: 2,
  //     },
  //   ],
  // },

  // // General Knowledge & Current Affairs
  // {
  //   id: "gk",
  //   title: "General Knowledge & Current Affairs",
  //   description: "Stay updated on general awareness and current affairs for placement HR rounds.",
  //   icon: "Globe",
  //   color: "bg-yellow-500",
  //   videos: [
  //     {
  //       id: "gk-1",
  //       title: "Current Affairs: Latest Events",
  //       description: "Covers recent events, awards, economy, and tech news relevant for placement interviews.",
  //       youtubeId: "XqT_Current123",
  //       duration: "30:00",
  //       order: 1,
  //     },
  //     {
  //       id: "gk-2",
  //       title: "Static GK Essentials",
  //       description: "Important facts about countries, capitals, Indian history, geography, and science.",
  //       youtubeId: "XqT_Static456",
  //       duration: "40:00",
  //       order: 2,
  //     },
  //   ],
  // },
];


/**
 * Get course data by its ID
 * @param courseId The unique identifier of the course
 * @returns The course object or null if not found
 */
export const getCourseData = (courseId: string): Course | null => {
  if (!courseId) return null;
  
  const course = crashCourseData.find(course => course.id === courseId);
  return course || null;
};

/**
 * Get a specific video from a course by its ID
 * @param courseId The unique identifier of the course
 * @param videoId The unique identifier of the video
 * @returns The video object or null if not found
 */
export const getCourseVideoById = (courseId: string, videoId: string): Video | null => {
  if (!courseId || !videoId) return null;
  
  const course = getCourseData(courseId);
  if (!course) return null;
  
  const video = course.videos.find(video => video.id === videoId);
  return video || null;
};

/**
 * Get the next video in a course sequence
 * @param courseId The unique identifier of the course
 * @param currentVideoId The unique identifier of the current video
 * @returns The next video object or null if this is the last video
 */
export const getNextVideo = (courseId: string, currentVideoId: string): Video | null => {
  if (!courseId || !currentVideoId) return null;
  
  const course = getCourseData(courseId);
  if (!course) return null;
  
  const currentVideo = getCourseVideoById(courseId, currentVideoId);
  if (!currentVideo) return null;
  
  const nextVideo = course.videos.find(video => video.order === currentVideo.order + 1);
  return nextVideo || null;
};

/**
 * Get the previous video in a course sequence
 * @param courseId The unique identifier of the course
 * @param currentVideoId The unique identifier of the current video
 * @returns The previous video object or null if this is the first video
 */
export const getPreviousVideo = (courseId: string, currentVideoId: string): Video | null => {
  if (!courseId || !currentVideoId) return null;
  
  const course = getCourseData(courseId);
  if (!course) return null;
  
  const currentVideo = getCourseVideoById(courseId, currentVideoId);
  if (!currentVideo) return null;
  
  const previousVideo = course.videos.find(video => video.order === currentVideo.order - 1);
  return previousVideo || null;
};
