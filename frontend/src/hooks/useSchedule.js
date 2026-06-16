import { useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './useAuth';

export const useSchedule = () => {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data.data?.schedules || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const generateSchedule = useCallback(async (scheduleConfig) => {
    try {
      const response = await api.post('/schedules/generate', scheduleConfig);
      await fetchSchedules();
      return response.data.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }, [fetchSchedules]);

  const updateSchedule = useCallback(
    async (id, updateData) => {
      try {
        const response = await api.put(`/schedules/${id}`, updateData);
        const updated = response.data.data;
        setSchedules(schedules.map((s) => (s._id === id ? updated : s)));
        return updated;
      } catch (err) {
        throw err.response?.data || err;
      }
    },
    [schedules]
  );

  const completeSession = useCallback(
    async (id, performanceScore) => {
      try {
        const response = await api.post(`/schedules/${id}/complete`, {
          performanceScore,
        });
        const updated = response.data.data;
        setSchedules(schedules.map((s) => (s._id === id ? updated : s)));
        return updated;
      } catch (err) {
        throw err.response?.data || err;
      }
    },
    [schedules]
  );

  const deleteSchedule = useCallback(
    async (id) => {
      try {
        await api.delete(`/schedules/${id}`);
        setSchedules(schedules.filter((s) => s._id !== id));
      } catch (err) {
        throw err.response?.data || err;
      }
    },
    [schedules]
  );

  const getStats = useCallback(async () => {
    try {
      const response = await api.get('/schedules/stats');
      return response.data.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    generateSchedule,
    updateSchedule,
    completeSession,
    deleteSchedule,
    getStats,
  };
};

export default useSchedule;
