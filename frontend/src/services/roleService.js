import api from './api';

export const fetchRoles = () => api.get('/roles');
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

export const assignPermissionsToRole = (roleId, permissionIds) =>
  api.post(`/permissions/assign/${roleId}`, { permissionIds });

export const getRolePermissions = (roleId) =>
  api.get(`/permissions/role/${roleId}`);
