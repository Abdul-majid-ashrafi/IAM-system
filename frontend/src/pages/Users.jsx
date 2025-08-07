import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser, updateUser, fetchUserGroups } from '../services/userService';
import { toast } from 'react-toastify';
import PermissionAlert from '../components/PermissionAlert';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // fetched permissions frm store
  const allPermissions = useSelector((state) => state.permissions.items);
  // permissions check
  const canViewUsers = hasPermission(allPermissions, 'Users', 'read');
  const canCreateUsers = hasPermission(allPermissions, 'Users', 'create');
  const canUpdateUsers = hasPermission(allPermissions, 'Users', 'update');
  const canDeleteUsers = hasPermission(allPermissions, 'Users', 'delete');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      const usersList = res.data || [];

      // fetch groups for each user (parallel)
      const usersWithGroups = await Promise.all(
        usersList.map(async (u) => {
          try {
            const gRes = await fetchUserGroups(u.id);
            return { ...u, groups: gRes.data || [] };
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            return { ...u, groups: [] };
          }
        })
      );

      setUsers(usersWithGroups);
    } catch (err) {
      // setHasPermission(err.response?.data?.code !== "1001")
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({ username, password });
      setUsername('');
      setPassword('');
      loadUsers();
      toast.success('User created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async (id) => {
    if (!canDeleteUsers) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    if (!confirm('Delete user?')) return;
    try {
      await deleteUser(id);
      loadUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete User'
      );
    }
  };

  const startEdit = (u) => {
    if (!canUpdateUsers) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    setEditingId(u.id);
    setEditUsername(u.username);
    setEditPassword('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUsername('');
    setEditPassword('');
  };

  const handleSaveEdit = async () => {
    try {
      const payload = { username: editUsername };
      if (editPassword) payload.password = editPassword;
      await updateUser(editingId, payload);
      cancelEdit();
      loadUsers();
      toast.success('User update successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    }
  };

  const noPermissions = (!canCreateUsers && !canDeleteUsers && !canUpdateUsers && !canViewUsers);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      {noPermissions ? (<PermissionAlert />) : (
        <>
          {!canCreateUsers ? <PermissionAlert section="create users" /> :
            <form onSubmit={handleAddUser} className="mb-6 flex flex-col gap-3 max-w-md">
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                placeholder="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <button type="submit" className="bg-blue-600 text-white py-2 rounded">Add User</button>
            </form>
          }
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <>
              {!canViewUsers ? <PermissionAlert section="read/view users" /> :
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="bg-white p-3 shadow rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-600">
                            Groups: {user.groups && user.groups.length ? user.groups.map(g => g.name).join(', ') : '—'}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => startEdit(user)} className="text-sm text-yellow-600 hover:underline">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="text-sm text-red-600 hover:underline">
                            Delete
                          </button>
                        </div>
                      </div>

                      {editingId === user.id && (
                        <div className="mt-3 border-t pt-3">
                          <input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="p-2 border rounded mb-2 w-full"
                          />
                          <input
                            placeholder="New password (leave blank to keep)"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            type="password"
                            className="p-2 border rounded mb-2 w-full"
                          />
                          <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                            <button onClick={cancelEdit} className="px-4 py-2 border rounded">Cancel</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              }
            </>
          )}
        </>
      )}
    </div>
  );
}

