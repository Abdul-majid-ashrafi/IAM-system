import React, { useEffect, useState } from 'react';
import {
  fetchGroups,
  createGroup,
  deleteGroup,
  assignUsersToGroup,
  getGroupUsers,
  assignRolesToGroup,
  getGroupRoles,
  updateGroup
} from '../services/groupService';
import { fetchUsers } from '../services/userService';
import { fetchRoles } from '../services/roleService';
import { toast } from 'react-toastify';
import PermissionAlert from '../components/PermissionAlert';
import { hasPermission } from '../utils';
import { useSelector } from 'react-redux';


export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupRoles, setGroupRoles] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');

  // fetched permissions from store
  const allPermissions = useSelector((state) => state.permissions.items);
  // permissions check
  const canViewGroups = hasPermission(allPermissions, 'Groups', 'read');
  const canCreateGroups = hasPermission(allPermissions, 'Groups', 'create');
  const canUpdateGroups = hasPermission(allPermissions, 'Groups', 'update');
  const canDeleteGroups = hasPermission(allPermissions, 'Groups', 'delete');

  const loadData = async () => {
    try {
      const [groupsRes, usersRes, rolesRes] = await Promise.allSettled([
        fetchGroups(),
        fetchUsers(),
        fetchRoles()
      ]);

      if (groupsRes.status === 'fulfilled') {
        setGroups(groupsRes.value.data);
      } else {
        console.error("Failed to fetch groups:", groupsRes.reason);
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data);
      } else {
        console.error("Failed to fetch users:", usersRes.reason);
      }

      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data);
      } else {
        console.error("Failed to fetch roles:", rolesRes.reason);
      }

    } catch (err) {
      console.error("Unexpected error in loadData:", err);
    }
  };

  const loadGroupAssignments = async (groupId) => {
    const [usersRes, rolesRes] = await Promise.all([
      getGroupUsers(groupId),
      getGroupRoles(groupId)
    ]);
    setGroupUsers(usersRes.data);
    setGroupRoles(rolesRes.data);
    setSelectedUserIds(usersRes.data.map(u => u.id));
    setSelectedRoleIds(rolesRes.data.map(r => r.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroup({ name: groupName });
      toast.success('Group created successfully');
      setGroupName('');
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to create group'
      );
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!canDeleteGroups) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    if (!confirm('Delete group?')) return;
    try {
      await deleteGroup(id);
      setSelectedGroup(null);
      loadData();
      toast.success('Group deleted successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete group'
      );
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    await loadGroupAssignments(group.id);
  };

  const handleAssign = async () => {
    if (!selectedGroup) return;

    try {
      await Promise.all([
        assignUsersToGroup(selectedGroup.id, selectedUserIds),
        assignRolesToGroup(selectedGroup.id, selectedRoleIds)
      ]);
      toast.success('Group assignments updated successfully');
      loadGroupAssignments(selectedGroup.id);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update group assignments'
      );
    }
  };

  const toggleId = (id, list, setList) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const requiredDataNotFound = (roles.length === 0 || users.length === 0);

  const startEditGroup = (g) => {
    if (!canUpdateGroups) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    setEditingGroup(g.id);
    setEditGroupName(g.name);
  };

  const saveGroupEdit = async () => {
    try {
      if (!editingGroup) return;
      await updateGroup(editingGroup, { name: editGroupName });
      setEditingGroup(null);
      setEditGroupName('');
      loadData();
      toast.success('Group updated successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update group'
      );
    }
  };

  const cancelGroupEdit = () => {
    setEditingGroup(null);
    setEditGroupName('');
  };

  const noPermissions = (!canCreateGroups && !canDeleteGroups && !canUpdateGroups && !canViewGroups);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Groups</h2>
      {noPermissions ? (<PermissionAlert />) : (
        <>
          {!canCreateGroups ? <PermissionAlert section="create groups" /> :
            <form onSubmit={handleCreateGroup} className="mb-4 flex gap-3">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="p-2 border rounded"
                required
              />
              <button className="bg-blue-600 text-white px-4 rounded">Create</button>
            </form>
          }

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">All Groups</h3>
              {!canViewGroups ? <PermissionAlert section="read/view groups" /> :
                <ul className="space-y-2">
                  {groups.map((group) => (
                    <React.Fragment key={group.id}>
                      <li className="p-3 rounded shadow flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                          <span
                            className="cursor-pointer font-medium"
                            onClick={() => handleSelectGroup(group)}
                          >
                            {group.name}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditGroup(group)}
                            className="text-sm text-yellow-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>

                      {/* Render edit form below this row */}
                      {editingGroup === group.id && (
                        <li className="p-4 bg-gray-50 border rounded shadow mt-2 ml-4 mr-4">
                          <h4 className="font-semibold mb-2">Edit Group</h4>
                          <input
                            className="p-2 border rounded w-full mb-2"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveGroupEdit}
                              className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelGroupEdit}
                              className="px-4 py-2 border rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </li>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              }
            </div>

            {selectedGroup && (
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Assign to Group: {selectedGroup.name}
                </h3>

                <div className="mb-4">
                  <h4 className="font-semibold">Assigned Roles</h4>
                  <div className="mt-2">
                    {groupRoles.length === 0 ? <div className="text-sm text-gray-600">No roles</div> :
                      <ul className="list-disc pl-6">
                        {groupRoles.map(r => <li key={r.id}>{r.name}</li>)}
                      </ul>
                    }
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold">Users</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {users.map((user) => (
                      <label key={user.id} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() =>
                            toggleId(user.id, selectedUserIds, setSelectedUserIds)
                          }
                        />
                        {user.username}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold">Roles</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() =>
                            toggleId(role.id, selectedRoleIds, setSelectedRoleIds)
                          }
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>

                {requiredDataNotFound &&
                  <p className="mt-2 text-sm text-gray-500">
                    You must have at least one user and one role to perform this action.
                  </p>
                }
                <button
                  onClick={handleAssign}
                  disabled={requiredDataNotFound}
                  className={`px-4 py-2 rounded text-white bg-green-600 ${requiredDataNotFound ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Save Assignments
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
