const { db } = require('../database');

// Get current user’s effective permissions
exports.getMyPermissions = (req, res) => {
    const userId = req.user.userId;

    const sql = `
    SELECT DISTINCT p.module, p.action FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN group_roles gr ON gr.role_id = rp.role_id
    JOIN group_users gu ON gu.group_id = gr.group_id
    WHERE gu.user_id = ?
  `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error retrieving permissions' });
        res.json({ permissions: rows });
    });
};

// Simulate action check
exports.simulateAction = (req, res) => {
    const { module, action } = req.body;
    const userId = req.user.userId;

    const sql = `
    SELECT 1 FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN group_roles gr ON gr.role_id = rp.role_id
    JOIN group_users gu ON gu.group_id = gr.group_id
    WHERE gu.user_id = ? AND p.module = ? AND p.action = ?
  `;

    db.get(sql, [userId, module, action], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error simulating action' });
        res.json({ allowed: !!result });
    });
};
