import React, { useEffect, useState } from 'react';
import {
  fetchRoles,
  createRole,
  deleteRole,
  assignPermissionsToRole,
  getRolePermissions,
  updateRole
} from '../services/roleService';
import { fetchPermissions } from '../services/permissionService';
import { toast } from 'react-toastify';
import PermissionAlert from '../components/PermissionAlert';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');

  // fetched permissions from store
  const allPermissions = useSelector((state) => state.permissions.items);
  // permissions check
  const canViewRoles = hasPermission(allPermissions, 'Roles', 'read');
  const canCreateRoles = hasPermission(allPermissions, 'Roles', 'create');
  const canUpdateRoles = hasPermission(allPermissions, 'Roles', 'update');
  const canDeleteRoles = hasPermission(allPermissions, 'Roles', 'delete');

  const loadData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        fetchRoles(),
        fetchPermissions(),
      ]);

      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data);
      } else {
        console.error("Failed to fetch roles:", rolesRes.reason);
        toast.error("Failed to fetch roles");
      }

      if (permsRes.status === 'fulfilled') {
        setPermissions(permsRes.value.data);
      } else {
        console.error("Failed to fetch permissions:", permsRes.reason);
        // toast.error("Failed to fetch permissions");
      }

    } catch (err) {
      console.error("Unexpected error while loading roles or permissions:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await createRole({ name: roleName });
      setRoleName('');
      loadData();
      toast.success('Role created successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to create role'
      );
    }
  };

  const handleDeleteRole = async (id) => {
    if (!canDeleteRoles) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    if (!confirm('Delete role?')) return;
    try {
      await deleteRole(id);
      setSelectedRole(null);
      loadData();
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete Role'
      );
    }
  };

  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    const res = await getRolePermissions(role.id);
    setSelectedPermissionIds(res.data.map((p) => p.id));
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    try {
      await assignPermissionsToRole(selectedRole.id, selectedPermissionIds);
      toast.success('Permissions updated');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed Permissions updated'
      );
    }
  };

  const togglePermission = (id) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startEditRole = (r) => {
    if (!canUpdateRoles) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    setEditingRoleId(r.id);
    setEditRoleName(r.name);
  };

  const cancelEditRole = () => {
    setEditingRoleId(null);
    setEditRoleName('');
  };

  const saveEditRole = async () => {
    if (!editingRoleId) return;
    try {
      await updateRole(editingRoleId, { name: editRoleName });
      setEditingRoleId(null);
      setEditRoleName('');
      loadData();
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update role'
      );
    }
  };

  const noPermissions = (!canCreateRoles && !canDeleteRoles && !canUpdateRoles && !canViewRoles);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Roles</h2>
      {noPermissions ? (<PermissionAlert />) : (
        <>
          {!canCreateRoles ? <PermissionAlert section="create roles" /> :
            <form onSubmit={handleCreateRole} className="mb-4 flex gap-3">
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Role name"
                className="p-2 border rounded"
                required
              />
              <button className="bg-blue-600 text-white px-4 rounded">Create</button>
            </form>
          }
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">All Roles</h3>
              {!canViewRoles ? <PermissionAlert section="read/view roles" /> :
                <ul className="space-y-2">
                  {roles.map((role) => (
                    <li key={role.id} className="bg-white rounded shadow">
                      <div className="p-3 flex justify-between items-center">
                        <span
                          className="cursor-pointer font-medium"
                          onClick={() => handleSelectRole(role)}
                        >
                          {role.name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditRole(role)}
                            className="text-sm text-yellow-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {editingRoleId === role.id && (
                        <div className="border-t p-3 bg-gray-50 rounded-b">
                          <h3 className="font-semibold mb-2 text-sm">Edit Role</h3>
                          <input
                            className="p-2 border rounded w-full mb-2"
                            value={editRoleName}
                            onChange={(e) => setEditRoleName(e.target.value)}
                            placeholder="Role name"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditRole}
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditRole}
                              className="px-4 py-2 border rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              }
            </div>

            {selectedRole && (
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">Assign Permissions: {selectedRole.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex gap-2">
                      <input type="checkbox" checked={selectedPermissionIds.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                      {perm.module} — {perm.action}
                    </label>
                  ))}
                </div>

                <button onClick={handleAssignPermissions} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Save Permissions</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
