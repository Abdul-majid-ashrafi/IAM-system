import React, { useEffect, useState } from 'react';
import {
  fetchPermissions,
  createPermission,
  deletePermission,
  updatePermission
} from '../services/permissionService';
import { fetchModules } from '../services/moduleService';
import PermissionAlert from '../components/PermissionAlert';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils';
import { toast } from 'react-toastify';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState(''); // selected module name
  const [action, setAction] = useState('');
  const [editing, setEditing] = useState(null);
  const [editModule, setEditModule] = useState('');
  const [editAction, setEditAction] = useState('');

  // fetched permissions from store
  const allPermissions = useSelector((state) => state.permissions.items);
  // permissions check
  const canViewPermissions = hasPermission(allPermissions, 'Permissions', 'read');
  const canCreatePermissions = hasPermission(allPermissions, 'Permissions', 'create');
  const canUpdatePermissions = hasPermission(allPermissions, 'Permissions', 'update');
  const canDeletePermissions = hasPermission(allPermissions, 'Permissions', 'delete');

  const load = async () => {
    try {
      const [pRes, mRes] = await Promise.allSettled([
        fetchPermissions(),
        fetchModules(),
      ]);

      if (pRes.status === 'fulfilled') {
        setPermissions(pRes.value.data);
      } else {
        console.error("Failed to fetch permissions:", pRes.reason);
        // toast.error("Failed to fetch permissions");
      }

      if (mRes.status === 'fulfilled') {
        setModules(mRes.value.data);
        if (!moduleName && mRes.value.data.length) {
          setModuleName(mRes.value.data[0].name);
        }
      } else {
        console.error("Failed to fetch modules:", mRes.reason);
        // toast.error("Failed to fetch modules");
      }

    } catch (err) {
      console.error("Unexpected error during load:", err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPermission({ module: moduleName, action });
      setAction('');
      load();
      toast.success('Permisson created successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to create permission'
      );
    }
  };

  const startEdit = (perm) => {
    if (!canUpdatePermissions) {
      toast.error("Insufficient permissions to perform this action.");
      return
    }
    setEditing(perm);
    setEditModule(perm.module);
    setEditAction(perm.action);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updatePermission(editing.id, { module: editModule, action: editAction });
      setEditing(null);
      load();
      toast.success('Permisson updated successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to udpate permission'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!canDeletePermissions) {
      toast.error("Insufficient permissions to perform this action.");
      return;
    }
    if (!confirm('Delete permission?')) return;
    await deletePermission(id);
    load();
  };

  const noPermissions = (!canCreatePermissions && !canDeletePermissions && !canUpdatePermissions && !canViewPermissions);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Permissions</h2>
      {noPermissions ? (<PermissionAlert />) : (
        <>
          {!canCreatePermissions ? <PermissionAlert section="create permissions" /> :
            <form onSubmit={handleCreate} className="mb-4 grid grid-cols-3 gap-2 items-end max-w-2xl">
              <div>
                <label className="text-sm block mb-1">Module</label>
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="p-2 border rounded w-full"
                  required
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm block mb-1">Action</label>
                <input
                  className="p-2 border rounded w-full"
                  placeholder="e.g., create | read | update | delete"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                />
              </div>

              <div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Permission</button>
              </div>
            </form>
          }
          {!canViewPermissions ? <PermissionAlert section="read/view permissions" /> :
            <div className="space-y-2">
              {permissions.map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-center bg-white p-3 rounded shadow">
                    <div>
                      <div className="font-medium">
                        {p.module} — <span className="text-sm">{p.action}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-sm text-yellow-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editing?.id === p.id && (
                    <div className="mt-2 bg-gray-50 p-4 rounded border border-gray-200 max-w-2xl">
                      <h3 className="font-semibold mb-2 text-sm">Editing Permission</h3>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editModule}
                          onChange={(e) => setEditModule(e.target.value)}
                          className="p-2 border rounded"
                        >
                          {modules.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>

                        <input
                          value={editAction}
                          onChange={(e) => setEditAction(e.target.value)}
                          className="p-2 border rounded"
                          placeholder="e.g., create | read | update | delete"
                        />
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleUpdate}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-4 py-2 border rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </>
      )}
    </div>
  );
}
