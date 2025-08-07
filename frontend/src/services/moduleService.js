import api from './api';

export const fetchModules = () => api.get('/modules');
export const createModule = (data) => api.post('/modules', data);
export const updateModule = (id, data) => api.put(`/modules/${id}`, data);
export const deleteModule = (id) => api.delete(`/modules/${id}`);
