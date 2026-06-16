import dotenv from "dotenv";

dotenv.config();

// Helper to make fetch request to Gemini API
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Invalid response from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini API call failed, falling back. Error:", error.message);
    throw error;
  }
};

/**
 * Generate Study Plan
 */
export const aiGenerateStudyPlan = async ({ examDate, subjects, hoursPerDay, difficultyLevel }) => {
  const prompt = `You are an expert academic AI planner.
Generate a study plan timetable.
Exam Date: ${examDate}
Subjects: ${subjects.join(", ")}
Target study hours per day: ${hoursPerDay}
Difficulty level: ${difficultyLevel}

Output the plan as a valid JSON array of objects. Do not include markdown formatting or backticks, just the raw JSON.
Each object must have the following format:
{
  "day": "Day 1",
  "topic": "Subject - Topic Name",
  "duration": ${hoursPerDay}
}
Generate around 5 to 10 days of plan.`;

  try {
    const rawResponse = await callGemini(prompt);
    // Sanitize markdown if any
    const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.log("Using intelligent fallback for Study Plan generation...");
    // Fallback logic
    const plan = [];
    const days = 7;
    for (let i = 1; i <= days; i++) {
      const subject = subjects[(i - 1) % subjects.length] || "General";
      plan.push({
        day: `Day ${i}`,
        topic: `${subject} - Core Concepts review & practice problems`,
        duration: Number(hoursPerDay) || 4,
      });
    }
    return plan;
  }
};

/**
 * Syllabus breakdown / Suggest topics
 */
export const aiSuggestTopics = async (subjectName) => {
  const prompt = `You are a helpful academic AI syllabus breakdown assistant.
Generate a structured breakdown of major study topics for the subject: "${subjectName}".
Output the breakdown as a valid JSON array of objects. Do not include markdown formatting or backticks, just the raw JSON.
Each object must have the following format:
{
  "name": "Topic Name",
  "hours": 3
}`;

  try {
    const rawResponse = await callGemini(prompt);
    const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.log("Using intelligent fallback for Topic suggestions...");
    const library = {
      physics: [
        { name: "Quantum Mechanics & Wave Functions", hours: 4 },
        { name: "Thermodynamics & Heat Transfer", hours: 3 },
        { name: "Electromagnetism & Maxwell's Equations", hours: 5 },
        { name: "Classical Mechanics & Particle Kinetics", hours: 4 },
        { name: "Optics & Light Diffraction", hours: 3 },
      ],
      math: [
        { name: "Linear Algebra & Matrices", hours: 4 },
        { name: "Calculus III - Integration & Derivatives", hours: 5 },
        { name: "Probability Theory & Statistics", hours: 3 },
        { name: "Graph Theory & Combinatorics", hours: 3 },
        { name: "Differential Equations", hours: 4 },
      ],
      biology: [
        { name: "Cell Biology & Organelles", hours: 3 },
        { name: "Genetics & DNA Replication", hours: 4 },
        { name: "Ecology & Ecosystem Dynamics", hours: 3 },
        { name: "Evolutionary Theory & Taxonomy", hours: 2 },
        { name: "Human Physiology & Systems", hours: 5 },
      ],
      chemistry: [
        { name: "Chemical Bonding & Molecular Geometry", hours: 3 },
        { name: "Stoichiometry & Reaction Kinetics", hours: 4 },
        { name: "Organic Chemistry - Alkanes & Functional Groups", hours: 5 },
        { name: "Thermodynamics & Electrochemistry", hours: 4 },
        { name: "Acids, Bases & Titration", hours: 3 },
      ],
      history: [
        { name: "The Industrial Revolution & Technological Growth", hours: 3 },
        { name: "World War I - Causes & Global Impacts", hours: 4 },
        { name: "World War II & Post-War Rebuilding", hours: 4 },
        { name: "The Cold War Era & Decolonization", hours: 3 },
        { name: "Ancient Civilizations & Social Hierarchies", hours: 3 },
      ],
    };

    const key = subjectName.toLowerCase();
    const matchedKey = Object.keys(library).find((k) => key.includes(k));
    if (matchedKey) {
      return library[matchedKey];
    }

    // Default general breakdown
    return [
      { name: `Fundamentals of ${subjectName}`, hours: 3 },
      { name: `Intermediate Applications & Theories of ${subjectName}`, hours: 4 },
      { name: `Advanced Problems & Case Studies in ${subjectName}`, hours: 5 },
      { name: `Comprehensive Revision & Peer Testing of ${subjectName}`, hours: 3 },
    ];
  }
};

/**
 * AI Chat Assistant
 */
export const aiChatResponse = async (message, contextData) => {
  const { user, subjects, schedules, tasks } = contextData;

  const prompt = `You are a warm, highly-supportive academic AI Coach.
You are helping ${user.name} with their study schedule.
Here is the student's current progress context:
- Level: ${user.studyLevel || "Intermediate"}
- Goal: ${user.studyGoal || "Exam Preparation"}
- Theme: ${user.preferences?.theme || "dark"}
- Active subjects: ${JSON.stringify(
    subjects.map((s) => ({
      name: s.name,
      hoursCompleted: s.hoursCompleted,
      totalHours: s.totalHours,
      difficulty: s.difficulty,
      examDate: s.examDate,
    }))
  )}
- Scheduled study sessions: ${JSON.stringify(
    schedules.map((sc) => ({
      date: sc.scheduledDate,
      subjectName: sc.subjectId?.name,
      topicName: sc.topicId?.name,
      isCompleted: sc.isCompleted,
    }))
  )}
- Active tasks: ${JSON.stringify(
    tasks.map((t) => ({
      title: t.title,
      subject: t.subject,
      priority: t.priority,
      status: t.status,
    }))
  )}

The user asks: "${message}"

Give a brief (2-3 sentences), highly-motivating, helpful response directly answering their question. If they ask about weakest subject, hours left, or what to study, base it on the context provided above. Make your response sound friendly and expert.`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.log("Using intelligent fallback for chat response...");
    const text = message.toLowerCase();

    // 1. Weakest subject
    if (text.includes("weak") || text.includes("weakest")) {
      if (!subjects || subjects.length === 0) {
        return "You haven't registered any subjects yet! Go ahead and add some to let me analyze your progress.";
      }
      // Find subject with lowest completion rate
      let weakest = subjects[0];
      let lowestRate = weakest.totalHours > 0 ? weakest.hoursCompleted / weakest.totalHours : 0;

      subjects.forEach((s) => {
        const rate = s.totalHours > 0 ? s.hoursCompleted / s.totalHours : 0;
        if (rate < lowestRate) {
          lowestRate = rate;
          weakest = s;
        }
      });

      return `Based on your logs, "${weakest.name}" is currently your weakest area (only ${Math.round(lowestRate * 100)}% complete). I recommend scheduling a 1-hour focus session on its first topic today!`;
    }

    // 2. What should I study today?
    if (text.includes("study today") || text.includes("schedule today") || text.includes("study now")) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todaySessions = schedules.filter((s) => {
        const schedStr = new Date(s.scheduledDate).toISOString().split("T")[0];
        return schedStr === todayStr && !s.isCompleted;
      });

      if (todaySessions.length > 0) {
        const session = todaySessions[0];
        const subName = session.subjectId?.name || "your subjects";
        const topName = session.topicId?.name || "review";
        return `Today, your plan schedules deep work in ${subName} covering "${topName}". Log in and mark it complete once done to boost your streak!`;
      }

      // Check tasks
      const pendingTasks = tasks.filter((t) => t.status === "Pending");
      if (pendingTasks.length > 0) {
        return `You have no scheduled sessions today, but you have ${pendingTasks.length} pending checklist tasks! I suggest tackling "${pendingTasks[0].title}" first.`;
      }

      return "You have a clear schedule today! It is a great time to do some review sessions or add a new topic you'd like to get ahead on.";
    }

    // 3. How many hours left?
    if (text.includes("hours left") || text.includes("remaining") || text.includes("how long")) {
      let totalNeeded = 0;
      let totalDone = 0;
      subjects.forEach((s) => {
        totalNeeded += s.totalHours;
        totalDone += s.hoursCompleted;
      });

      const hoursLeft = Math.max(totalNeeded - totalDone, 0);
      if (hoursLeft === 0) {
        return "You have completed all scheduled hours! Excellent work! Ready to set your next academic challenge?";
      }

      return `You have exactly ${hoursLeft} study hours left to complete your active curriculum. Keep pushing; consistency is the key to mastering these topics!`;
    }

    // Generic fallback responses
    return `Hey there! Looking at your goals, you're doing great on your ${user.studyGoal || "Exam Preparation"}. Keep completing your daily scheduled blocks to secure your study streak! Let me know if you need study tips or details about your subjects.`;
  }
};

/**
 * Productivity suggestions
 */
export const aiProductivitySuggestions = async (contextData) => {
  const { user, subjects, sessions } = contextData;

  const prompt = `You are a top academic productivity optimizer.
Analyze this student's data and provide 3 short bullet point suggestions.
Student: ${user.name}
Subjects: ${JSON.stringify(subjects.map((s) => ({ name: s.name, completed: s.hoursCompleted, total: s.totalHours })))}
Recent Study Sessions: ${JSON.stringify(
    sessions.slice(0, 10).map((s) => ({
      subject: s.subjectId?.name,
      mood: s.mood,
      performance: s.performance,
      distractions: s.distractions,
    }))
  )}

Output your answer as a valid JSON array of 3 strings. Do not include markdown formatting or backticks, just the raw JSON.`;

  try {
    const rawResponse = await callGemini(prompt);
    const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.log("Using intelligent fallback for productivity suggestions...");
    const list = [
      "Dedicate a 45-minute focused study block to your lowest completion subject to balance your study coverage.",
      "Your logs show high energy levels in the morning; schedule your most difficult subjects (Hard priority) before 11:00 AM.",
      "Take a structured 10-minute break for every 50 minutes of deep work to maintain cognitive endurance and prevent fatigue.",
    ];

    if (subjects && subjects.length > 0) {
      let lowest = subjects[0];
      subjects.forEach((s) => {
        if (s.hoursCompleted < lowest.hoursCompleted) lowest = s;
      });
      list[0] = `Target "${lowest.name}" this week. It is currently your least studied subject.`;
    }

    return list;
  }
};
