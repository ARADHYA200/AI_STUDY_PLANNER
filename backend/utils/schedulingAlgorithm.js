/**
 * AI-Based Scheduling Algorithm
 * 
 * Generates personalized study schedule using weighted priority scoring
 * considering exam proximity, difficulty level, and user-defined importance
 */

const DIFFICULTY_LEVELS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const STUDY_WEIGHTS = {
  examProximity: 0.40,
  difficulty: 0.35,
  userPriority: 0.25,
};

const DAILY_BREAKS = {
  studyBlockDuration: 50, // minutes
  breakDuration: 10, // minutes
  longBreak: 30, // minutes after 3 blocks
};

/**
 * Calculate priority score for each topic
 * @param {Object} topic - Topic data with difficulty, weightage
 * @param {Date} examDate - Subject exam date
 * @param {Number} userPriority - User-defined priority (1-5)
 * @returns {Number} Calculated priority score (0-100)
 */
export const calculatePriorityScore = (topic, examDate, userPriority) => {
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(daysUntilExam, 1);

  // Exam proximity weight: Higher score if exam is closer
  const examProximityScore =
    (1 - daysUntilExam / Math.max(totalDays, 30)) * 100 *
    STUDY_WEIGHTS.examProximity;

  // Difficulty weight: Hard topics get higher priority
  const difficultyScore =
    (DIFFICULTY_LEVELS[topic.difficulty] / 3) *
    100 *
    STUDY_WEIGHTS.difficulty;

  // User priority weight: User-defined importance
  const userPriorityScore = (userPriority / 5) * 100 * STUDY_WEIGHTS.userPriority;

  // Topic weightage multiplier
  const topicWeightageMultiplier = topic.weightage / 100;

  return (
    (examProximityScore + difficultyScore + userPriorityScore) *
    topicWeightageMultiplier
  );
};

/**
 * Generate study schedule for user
 * @param {Array} subjects - Array of subject objects with topics
 * @param {Number} dailyAvailableHours - Hours available per day
 * @param {Date} startDate - Schedule start date
 * @param {Date} endDate - Schedule end date
 * @returns {Array} Generated schedule with time slots
 */
export const generateStudySchedule = (
  subjects,
  dailyAvailableHours,
  startDate,
  endDate
) => {
  const schedule = [];
  const topicsWithScores = [];

  // Calculate priority scores for all topics
  subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      const priorityScore = calculatePriorityScore(
        topic,
        subject.examDate,
        subject.priority
      );
      const topicObj = topic.toObject ? topic.toObject() : topic;
      topicsWithScores.push({
        ...topicObj,
        subjectId: subject._id,
        subjectName: subject.name,
        examDate: subject.examDate,
        priorityScore,
        totalSubjectHours: subject.totalHours,
      });
    });
  });

  // Sort topics by priority score (highest first)
  topicsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);

  // Distribute topics across available days
  const workingDays = getWorkingDays(startDate, endDate);
  let dayIndex = 0;
  const dailyAllocation = {};

  // Initialize daily allocation
  workingDays.forEach((date) => {
    dailyAllocation[dateToString(date)] = {
      hoursAllocated: 0,
      sessions: [],
    };
  });

  // Allocate learning sessions
  topicsWithScores.forEach((topic) => {
    let remainingHours = topic.estimatedHours;
    let sessionCount = 0;
    const topicSessions = [];
    let lastScheduledDate = workingDays[0];

    while (remainingHours > 0 && dayIndex < workingDays.length) {
      const currentDate = workingDays[dayIndex];
      const dateStr = dateToString(currentDate);
      const allocated = dailyAllocation[dateStr];
      lastScheduledDate = currentDate;

      // Calculate available time for this day
      const availableTimeToday =
        dailyAvailableHours - allocated.hoursAllocated;

      if (availableTimeToday < 1) {
        dayIndex++;
        continue;
      }

      // Allocate study session
      const sessionDuration = Math.min(remainingHours, availableTimeToday, 2); // Max 2 hours per session
      const sessions = createStudySessions(
        currentDate,
        sessionDuration,
        sessionCount,
        allocated.sessions
      );

      // Add topic and subject details to each session
      sessions.forEach((s) => {
        s.topicId = topic._id;
        s.subjectId = topic.subjectId;
        s.topicName = topic.name;
        s.subjectName = topic.subjectName;
      });

      allocated.sessions.push(...sessions);
      topicSessions.push(...sessions);
      allocated.hoursAllocated += sessionDuration;
      remainingHours -= sessionDuration;
      sessionCount += 1;

      // Move to next day if current day is full
      if (allocated.hoursAllocated >= dailyAvailableHours) {
        dayIndex++;
      }
    }
    topic.scheduledDate = lastScheduledDate;

    // Create schedule entry
    schedule.push({
      topicId: topic._id,
      subjectId: topic.subjectId,
      subjectName: topic.subjectName,
      topicName: topic.name,
      allocatedHours: topic.estimatedHours,
      difficulty: topic.difficulty,
      priorityScore: topic.priorityScore,
      sessions: topicSessions,
    });
  });

  // Create revision sessions (20% of total study time)
  const revisionSchedule = createRevisionSchedule(
    topicsWithScores,
    workingDays,
    dailyAvailableHours * 0.2,
    dailyAllocation
  );

  return {
    schedule,
    revisionSchedule,
    dailyAllocation,
    totalScheduledHours: calculateTotalHours(schedule),
    estimatedCompletionDate: estimateCompletion(schedule, dailyAvailableHours),
  };
};

/**
 * Create study sessions with breaks
 * @param {Date} date - Date of study session
 * @param {Number} duration - Duration in hours
 * @param {Number} sessionCount - Session count for the day
 * @param {Array} existingSession - Existing sessions for the day
 * @returns {Array} Array of study sessions with breaks
 */
const createStudySessions = (date, duration, sessionCount, existingSessions) => {
  const sessions = [];
  let startHour = 8; // Default start time (8 AM)

  // Adjust start time based on existing sessions
  if (existingSessions.length > 0) {
    const lastSession = existingSessions[existingSessions.length - 1];
    startHour = parseInt(lastSession.endTime.split(":")[0]) + 0.5; // Add 30 min gap
  }

  const durationMinutes = duration * 60;
  const totalMinutesNeeded = Math.ceil(durationMinutes / DAILY_BREAKS.studyBlockDuration) *
    (DAILY_BREAKS.studyBlockDuration + DAILY_BREAKS.breakDuration);

  let currentMinutes = startHour * 60;
  let studyBlocksCompleted = 0;

  while (studyBlocksCompleted * DAILY_BREAKS.studyBlockDuration < durationMinutes) {
    const blockStartTime = minutesToTime(currentMinutes);
    const blockEndTime = minutesToTime(
      currentMinutes + DAILY_BREAKS.studyBlockDuration
    );

    sessions.push({
      startTime: blockStartTime,
      endTime: blockEndTime,
      duration: DAILY_BREAKS.studyBlockDuration / 60,
      type: "Learning",
      date,
    });

    currentMinutes += DAILY_BREAKS.studyBlockDuration + DAILY_BREAKS.breakDuration;
    studyBlocksCompleted++;

    // Add long break after 3 study blocks
    if (studyBlocksCompleted % 3 === 0 && studyBlocksCompleted < 6) {
      currentMinutes += DAILY_BREAKS.longBreak / 2; // Additional break
    }
  }

  return sessions;
};

/**
 * Create revision schedule (spaced repetition)
 * @param {Array} topics - All topics with estimated hours
 * @param {Array} workingDays - Available working days
 * @param {Number} dailyRevisionHours - Hours allocated for revision per day
 * @param {Object} dailyAllocation - Current day allocation
 * @returns {Array} Revision schedule
 */
const createRevisionSchedule = (
  topics,
  workingDays,
  dailyRevisionHours,
  dailyAllocation
) => {
  const revisionSchedule = [];
  const revisionGaps = [1, 3, 7]; // Days for spaced repetition: 1st, 3rd, 7th day

  topics.forEach((topic) => {
    revisionGaps.forEach((gapDays, index) => {
      const revisionDate = new Date(topic.scheduledDate || workingDays[0]);
      revisionDate.setDate(revisionDate.getDate() + gapDays);

      if (revisionDate <= new Date(workingDays[workingDays.length - 1])) {
        const dateStr = dateToString(revisionDate);
        if (dailyAllocation[dateStr]) {
          // Allocate 30 minutes per revision
          revisionSchedule.push({
            topicId: topic._id,
            topicName: topic.name,
            subjectId: topic.subjectId,
            revisionDate,
            duration: 0.5,
            type: "Revision",
            revisionRound: index + 1,
          });
        }
      }
    });
  });

  return revisionSchedule;
};

/**
 * Get array of working days between two dates (excluding weekends)
 */
const getWorkingDays = (startDate, endDate) => {
  const days = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude Sunday (0) and Saturday (6)
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
};

/**
 * Convert minutes to HH:MM time format
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Convert date to string format YYYY-MM-DD
 */
const dateToString = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Calculate total scheduled hours
 */
const calculateTotalHours = (schedule) => {
  return schedule.reduce((total, item) => total + item.allocatedHours, 0);
};

/**
 * Estimate completion date based on study pace
 */
const estimateCompletion = (schedule, dailyHours) => {
  const totalHours = calculateTotalHours(schedule);
  const daysNeeded = Math.ceil(totalHours / dailyHours);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  return completionDate;
};

/**
 * Readjust schedule based on completed topics
 * @param {Array} schedule - Current schedule
 * @param {Array} completedTopics - Topics that are completed
 * @param {Array} remainingDays - Remaining available days
 * @returns {Array} Adjusted schedule
 */
export const readjustSchedule = (
  schedule,
  completedTopics,
  remainingDays,
  dailyAvailableHours
) => {
  const remainingTopics = schedule.filter(
    (item) => !completedTopics.includes(item.topicId.toString())
  );

  // Recalculate schedule for remaining topics
  const adjustedSchedule = generateStudySchedule(
    remainingTopics,
    dailyAvailableHours,
    remainingDays[0],
    remainingDays[remainingDays.length - 1]
  );

  return adjustedSchedule;
};

export default {
  calculatePriorityScore,
  generateStudySchedule,
  readjustSchedule,
};
