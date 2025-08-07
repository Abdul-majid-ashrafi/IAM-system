import React, { useEffect, useState } from 'react';
import { fetchModules, createModule, deleteModule, updateModule } from '../services/moduleService';
import PermissionAlert from '../components/PermissionAlert';
import { hasPermission } from '../utils';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function Modules() {
    const [modules, setModules] = useState([]);
    const [name, setName] = useState('');
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');

    // fetched permissions from store
    const allPermissions = useSelector((state) => state.permissions.items);
    // permissions check
    const canViewModules = hasPermission(allPermissions, 'Modules', 'read');
    const canCreateModules = hasPermission(allPermissions, 'Modules', 'create');
    const canUpdateModules = hasPermission(allPermissions, 'Modules', 'update');
    const canDeleteModules = hasPermission(allPermissions, 'Modules', 'delete');

    const load = async () => {
        try {
            const res = await fetchModules();
            setModules(res.data);
        } catch (err) {
            // setHasPermission(err.response?.data?.code !== "1001")
            console.error(err);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (canCreateModules) {
            try {
                await createModule({ name });
                setName('');
                load();
                toast.success('Module created successfully');
            } catch (error) {
                toast.error(
                    error.response?.data?.message || 'Failed to create module'
                );
            }
        }
    };

    const startEdit = (m) => {
        if (!canUpdateModules) {
            toast.error("Insufficient permissions to perform this action.");
            return
        }
        setEditing(m);
        setEditName(m.name);
    };

    const handleUpdate = async () => {
        if (!editing) return;
        try {
            await updateModule(editing.id, { name: editName });
            setEditing(null);
            setEditName('');
            load();
            toast.success('Module updated successfully');
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update module'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!canDeleteModules) {
            toast.error("Insufficient permissions to perform this action.");
            return
        }
        if (!confirm('Delete module?')) return;
        await deleteModule(id);
        load();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Modules</h2>

            {!canCreateModules && !canViewModules ? (<PermissionAlert />) : (
                <>
                    {!canCreateModules ? <PermissionAlert section="create modules" /> :
                        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
                            <input
                                className="p-2 border rounded"
                                placeholder="Module name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <button className="bg-blue-600 text-white px-4 rounded">Create</button>
                        </form>
                    }

                    {!canViewModules ? <PermissionAlert section="read/view modules" /> :
                        <div className="space-y-2">
                            {modules.map((m) => (
                                <div key={m.id}>
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow">
                                        <div>
                                            <div className="font-medium">{m.name}</div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEdit(m)}
                                                className="text-sm text-yellow-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Form */}
                                    {editing?.id === m.id && (
                                        <div className="mt-2 bg-gray-50 p-4 rounded border border-gray-200">
                                            <h3 className="font-semibold mb-2 text-sm">Editing Module</h3>
                                            <input
                                                className="p-2 border rounded w-full mb-2"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                            <div className="flex gap-2">
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
