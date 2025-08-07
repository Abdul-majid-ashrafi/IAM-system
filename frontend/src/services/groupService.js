import api from './api';

export const fetchGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

export const assignUsersToGroup = (groupId, userIds) =>
    api.post(`/groups/${groupId}/users`, { userIds });

export const getGroupUsers = (groupId) =>
    api.get(`/groups/${groupId}/users`);

export const assignRolesToGroup = (groupId, roleIds) =>
    api.post(`/groups/${groupId}/roles`, { roleIds });

export const getGroupRoles = (groupId) =>
    api.get(`/groups/${groupId}/roles`);
