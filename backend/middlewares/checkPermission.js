// backend/middlewares/checkPermission.js
const { db } = require('../database');

// checkPermission(moduleName, actionName)
function checkPermission(moduleName, actionName) {
    // console.log(moduleName, actionName);
    return (req, res, next) => {
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const sql = `
      SELECT 1 FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      JOIN group_roles gr ON gr.role_id = rp.role_id
      JOIN group_users gu ON gu.group_id = gr.group_id
      WHERE gu.user_id = ? AND p.module = ? AND p.action = ?
      LIMIT 1
    `;

        db.get(sql, [userId, moduleName, actionName], (err, row) => {
            if (err) {
                console.error('checkPermission error', err);
                return res.status(500).json({ message: 'Permission check error' });
            }
            if (!row) return res.status(403).json({ message: `Forbidden: Access denied — insufficient ${moduleName} permissions.`, code: "1001" });
            next();
        });
    };
}

module.exports = checkPermission;
