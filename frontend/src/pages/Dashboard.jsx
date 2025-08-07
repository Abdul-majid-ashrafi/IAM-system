import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { fetchModules } from '../services/moduleService';
import PermissionAlert from '../components/PermissionAlert';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils';

export default function Dashboard() {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // simulate
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedAction, setSelectedAction] = useState('read');
    const [simulateResult, setSimulateResult] = useState(null);
    const hasFetched = useRef(false);

    // fetched permissions from store
    const allPermissions = useSelector((state) => state.permissions.items);
    // permissions check
    const canViewModules = hasPermission(allPermissions, 'Modules', 'read');

    const fetchPermissions = async () => {
        try {
            const res = await api.get('/access/me/permissions');
            setPermissions(res.data.permissions || []);
        } catch (err) {
            console.error('Error fetching permissions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        fetchPermissions();
        (async () => {
            try {
                const mRes = await fetchModules();
                setModules(mRes.data);
                if (mRes.data.length) setSelectedModule(mRes.data[0].name);
            } catch (err) {
                // setHasPermission(err.response?.data?.code !== "1001")
                console.error(err);
            }
        })();
    }, []);

    const simulateAction = async (e) => {
        e.preventDefault();
        setSimulateResult(null);
        try {
            const res = await api.post('/access/simulate-action', { module: selectedModule, action: selectedAction });
            setSimulateResult(res.data.allowed ? 'Allowed' : 'Denied');
        } catch (err) {
            setSimulateResult('Error');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>

                    {loading ? <p>Loading permissions...</p> : (
                        <ul className="list-disc pl-6 space-y-1">
                            {permissions.length === 0 ? <li>No permissions assigned</li> :
                                permissions.map((perm, i) => <li key={i}><strong>{perm.module}</strong> — {perm.action}</li>)
                            }
                        </ul>
                    )}
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Simulate Action</h2>
                    {!canViewModules ? (<PermissionAlert />) : (
                        <>
                            <form onSubmit={simulateAction} className="space-y-3">
                                <div>
                                    <label className="text-sm block mb-1">Module</label>
                                    <select className="p-2 border rounded w-full" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                                        {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm block mb-1">Action</label>
                                    <select className="p-2 border rounded w-full" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                                        <option value="create">create</option>
                                        <option value="read">read</option>
                                        <option value="update">update</option>
                                        <option value="delete">delete</option>
                                    </select>
                                </div>

                                <div>
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Check</button>
                                </div>

                                {simulateResult && <div className="mt-3">Result: <strong>{simulateResult}</strong></div>}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
