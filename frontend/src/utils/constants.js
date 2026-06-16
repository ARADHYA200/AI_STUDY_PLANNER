export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GET_PROFILE: '/auth/profile',
  UPDATE_PREFERENCES: '/auth/preferences',

  // Subjects
  GET_SUBJECTS: '/subjects',
  CREATE_SUBJECT: '/subjects',
  UPDATE_SUBJECT: '/subjects/:id',
  DELETE_SUBJECT: '/subjects/:id',
  ADD_TOPICS: '/subjects/:id/topics',

  // Schedules
  GENERATE_SCHEDULE: '/schedules/generate',
  GET_SCHEDULE: '/schedules',
  UPDATE_SCHEDULE: '/schedules/:id',
  COMPLETE_SESSION: '/schedules/:id/complete',
  DELETE_SCHEDULE: '/schedules/:id',
  GET_STATS: '/schedules/stats',

  // Progress
  LOG_SESSION: '/progress/session',
  GET_HISTORY: '/progress/history',
  GET_TOPIC_PROGRESS: '/progress/topic/:topicId',
  GET_SUBJECT_PROGRESS: '/progress/subject/:subjectId',
  GET_ANALYTICS: '/progress/analytics',
  GET_STREAK: '/progress/streak',
  GET_TREND: '/progress/trend',
};

export const STUDY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const STUDY_GOALS = ['Exam Preparation', 'Skill Development', 'Personal Growth'];
export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
export const SESSION_TYPES = ['Learning', 'Practice', 'Revision'];

export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

export const TOAST_MESSAGES = {
  SUCCESS: 'Operation completed successfully!',
  ERROR: 'Something went wrong. Please try again.',
  LOADING: 'Loading...',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  SCHEDULE_GENERATED: 'Your study schedule has been generated!',
};
