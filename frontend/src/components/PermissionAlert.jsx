import React from 'react';

export default function PermissionAlert({ section = "this module" }) {
    return (
        <div className="bg-red-100 text-red-700 p-4 rounded shadow">
            🚫 You do not have access to {section}.
        </div>
    );
}
