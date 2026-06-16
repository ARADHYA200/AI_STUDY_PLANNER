import api from '../utils/api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
};

export const subjectService = {
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
  
  // Topics within subjects
  addTopic: (subjectId, topicData) => api.post(`/subjects/${subjectId}/topics`, topicData),
};

export const scheduleService = {
  getSchedules: (params) => api.get('/schedules', { params }),
  createSchedule: (data) => api.post('/schedules/generate', data), // Map to schedules/generate
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  completeSession: (id, data) => api.put(`/schedules/${id}/complete`, {
    performanceRating: data.performance ?? data.performanceRating,
    notes: data.notes,
    mood: data.mood,
  }),
};

export const progressService = {
  getOverallStats: () => api.get('/progress/analytics/daily'),
  getWeeklyTrend: () => api.get('/progress/trend'),
  getDailyStatus: (date) => api.get(`/progress/analytics/daily?startDate=${date}&endDate=${date}`),
  getStreak: () => api.get('/progress/streak'),
};

export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const aiService = {
  generateStudyPlan: (params) => api.post('/ai/generate-plan', params),
  suggestTopics: (subjectName) => api.get(`/ai/suggest-topics?subjectName=${encodeURIComponent(subjectName)}`),
  chat: (message) => api.post('/ai/chat', { message }),
  suggestions: () => api.get('/ai/suggestions'),
};

