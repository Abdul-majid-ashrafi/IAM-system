import api from './api';

export const fetchPermissions = () => api.get('/permissions');
export const createPermission = (data) => api.post('/permissions', data); // { module, action }
export const updatePermission = (id, data) => api.put(`/permissions/${id}`, data);
export const deletePermission = (id) => api.delete(`/permissions/${id}`);
export const fetchRolePermissions = (roleId) => api.get(`/permissions/role/${roleId}`);
