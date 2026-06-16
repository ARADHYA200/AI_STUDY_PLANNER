import { useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './useAuth';

export const useProgress = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logSession = useCallback(async (sessionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/progress/session', sessionData);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log session');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/progress/history', { params });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopicProgress = useCallback(async (topicId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/progress/topic/${topicId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch topic progress');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubjectProgress = useCallback(async (subjectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/progress/subject/${subjectId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subject progress');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/progress/analytics');
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStreak = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/progress/streak');
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch streak');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/progress/trend');
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trend');
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    logSession,
    getHistory,
    getTopicProgress,
    getSubjectProgress,
    getAnalytics,
    getStreak,
    getTrend,
  };
};

export default useProgress;
