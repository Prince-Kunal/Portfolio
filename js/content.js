/* =========================================================
   ALL PORTFOLIO CONTENT LIVES HERE.
   Edit this file to update both game mode and recruiter mode.
   Empty link fields ("") are hidden automatically.
   ========================================================= */
window.PK = window.PK || {};

PK.content = {
  profile: {
    name: "Prince Kunal",
    role: "AI/ML & full-stack developer",
    tagline:
      "B.Tech CSE (AI & ML) student who builds machine learning models, full-stack web apps and AI security tools.",
    location: "Bengaluru, India",
    status: "Open to internships",
    email: "kunalprince615@gmail.com",
    github: "https://github.com/Prince-Kunal",
    linkedin: "https://www.linkedin.com/in/princekunal",
    resume: "assets/Prince_Kunal_Resume.pdf",
    about:
      "Computer Science undergraduate specialising in AI and ML, graduating in 2029. I enjoy data science and building machine learning models, I build full-stack web apps with the MERN stack and Next.js, and I'm learning Go to contribute to LFX open-source projects.",
  },

  experience: [
    {
      id: "kollide",
      role: "Co-founder",
      org: "Kollide",
      dates: "Sep 2026 – Present",
      summary:
        "An app for meeting strangers or small groups in person for an activity they choose, such as cafe hopping, game nights, go-karting or pickleball.",
      bullets: [
        "Built with Next.js and Supabase, running most of the backend as Supabase Edge Functions, which respond faster than a backend hosted on Render's free tier.",
        "Runs entirely on free tiers and is built to handle about 10,000 users without paying for any service.",
        "Launched among friends with no marketing; 50+ users have signed up so far.",
      ],
      stack: ["Next.js", "Supabase", "Edge Functions"],
      links: { site: "" },
    },
    {
      id: "research",
      role: "Student Researcher",
      org: "Grand Valley State University (research collaboration)",
      dates: "Sep 2026 – Present",
      summary:
        "Building programs that estimate the infarct percentage of heart tissue slices from images, with students at Grand Valley State University, Michigan, USA.",
      bullets: [
        "Developing four approaches to the measurement: colour-rule segmentation, a random forest, DINOv3 and U-Net.",
      ],
      stack: ["Python", "Computer Vision", "Random Forest", "U-Net", "DINOv3"],
      links: {},
    },
  ],

  projects: [
    {
      id: "pulseloop",
      name: "PulseLoop",
      tagline:
        "Blood donation platform that predicts which registered donors are most likely to donate when a blood bank runs out of a blood group.",
      bullets: [
        "Records each donor's last donation, next eligible date, location, age and blood group; donors earn points and see a local leaderboard.",
        "In an emergency, a machine learning model ranks candidate donors by blood group, distance from the hospital, age, gender, time since last donation, donation streak and response to past emergency calls.",
      ],
      stack: ["Machine Learning", "Ranking model"],
      links: { demo: "", repo: "" },
      game: { screen: "#3A0B12", glow: "#FF8A8A" },
    },
    {
      id: "siege",
      name: "Siege",
      tagline:
        "AI red-teaming tool: an attacking agent tries to jailbreak a target agent, then the tool writes the policy that closes the hole.",
      bullets: [
        "Uses PyRIT to plan attacks, analysing each response to pivot and adapt.",
        "When it finds a breach it writes a Cedar policy to close it, describes any jailbreak Cedar can't fix so it can be addressed, and generates a report.",
      ],
      stack: ["PyRIT", "Cedar", "AI security"],
      links: { demo: "", repo: "" },
      game: { screen: "#2A0A1E", glow: "#FF5C7A" },
    },
    {
      id: "sherlock",
      name: "Sherlock",
      tagline:
        "Job referral tool that finds fresh openings, matches them to a resume, tailors a one-page resume for each role and drafts a short email to someone at the company.",
      bullets: [
        "Nothing is sent without manual review; approved emails go out through the Gmail API with daily caps, opt-out handling and reply tracking.",
      ],
      stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Next.js", "Gemini"],
      links: { demo: "", repo: "" },
      game: { screen: "#0B1530", glow: "#6FD3FF" },
    },
    {
      id: "cms",
      name: "College Management System",
      tagline:
        "MERN web app for live classes, attendance, timetables, online tests, notes, announcements, class group chats and event management.",
      bullets: [],
      stack: ["MongoDB", "Express.js", "React", "Node.js"],
      links: { demo: "", repo: "" },
      game: { screen: "#0E2A1A", glow: "#7CE38B" },
    },
  ],

  skills: [
    { group: "Languages", items: ["Python", "JavaScript", "Go"] },
    { group: "Web", items: ["MongoDB", "Express.js", "React", "Node.js", "Next.js", "Supabase", "SQL"] },
    {
      group: "Machine learning",
      items: ["Machine Learning", "Data Science", "Random Forest", "U-Net", "DINOv3", "Computer Vision"],
    },
    { group: "AI security", items: ["PyRIT", "Cedar"] },
    { group: "Other", items: ["Data Structures and Algorithms"] },
  ],

  // The 14 skills hidden in the game's blocks, in level order.
  gameSkills: [
    "Python", "JavaScript", "Go", "React", "Next.js", "Node.js", "MongoDB",
    "Express.js", "Supabase", "SQL", "PyRIT", "Cedar", "U-Net", "DINOv3",
  ],

  education: [
    { title: "B.Tech, Computer Science and Engineering (AI & ML)", place: "Polaris School of Technology", detail: "2025 – 2029" },
    { title: "Class XII", place: "Christ Academy", detail: "91%" },
    { title: "Class X (ICSE)", place: "Shantiniketan Trust School", detail: "96%" },
  ],

  achievements: [
    "Competed in 5 hackathons: won a consolation prize in one and finished in the top 5 in three.",
  ],

  // The five trophies at the end of the level.
  hackathons: ["CONSOLATION PRIZE", "TOP 5", "TOP 5", "TOP 5", "5 HACKATHONS"],
};

PK.esc = function (s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
};
