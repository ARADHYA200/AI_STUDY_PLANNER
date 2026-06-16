import { useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './useAuth';

export const useSubjects = () => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/subjects');
      const data = response.data.data || [];
      setSubjects(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch subjects';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createSubject = useCallback(async (subjectData) => {
    try {
      const response = await api.post('/subjects', subjectData);
      const newSubject = response.data.data;
      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create subject';
      throw new Error(message);
    }
  }, []);

  const updateSubject = useCallback(async (id, subjectData) => {
    try {
      const response = await api.put(`/subjects/${id}`, subjectData);
      const updated = response.data.data;
      setSubjects((prev) => prev.map((s) => (s._id === id ? updated : s)));
      return updated;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update subject';
      throw new Error(message);
    }
  }, []);

  const deleteSubject = useCallback(async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete subject';
      throw new Error(message);
    }
  }, []);

  const addTopics = useCallback(async (id, topics) => {
    try {
      const payload = Array.isArray(topics) ? { topics } : topics;
      const response = await api.post(`/subjects/${id}/topics`, payload);
      const updated = response.data.data;
      setSubjects((prev) => prev.map((s) => (s._id === id ? updated : s)));
      return updated;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add topics';
      throw new Error(message);
    }
  }, []);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopics,
  };
};

export default useSubjects;
