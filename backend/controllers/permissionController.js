const { db } = require('../database');

// GET all permissions
exports.getPermissions = (req, res) => {
    db.all('SELECT * FROM permissions', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching permissions' });
        res.json(rows);
    });
};

// GET one permission
exports.getPermission = (req, res) => {
    db.get('SELECT * FROM permissions WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Permission not found' });
        res.json(row);
    });
};

// CREATE permission
exports.createPermission = (req, res) => {
    const { module, action } = req.body;
    if (!module || !action)
        return res.status(400).json({ message: 'Module and action are required' });

    db.get(
        `SELECT * FROM permissions WHERE module = ? AND action = ?`,
        [module, action],
        (err, existing) => {
            if (err) return res.status(500).json({ message: 'Error checking permission' });

            if (existing) {
                return res.status(400).json({ message: 'Another permission with same module and action exists' });
            }

            db.run(
                `INSERT INTO permissions (module, action) VALUES (?, ?)`,
                [module, action],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Error creating permission' });
                    res.status(201).json({ id: this.lastID, module, action });
                }
            );
        }
    );
};

// UPDATE permission
exports.updatePermission = (req, res) => {
    const { id } = req.params;
    const { module, action } = req.body;

    if (!module || !action) {
        return res.status(400).json({ message: 'Module and action are required' });
    }

    db.get(
        `SELECT * FROM permissions WHERE module = ? AND action = ? AND id != ?`,
        [module, action, id],
        (err, existing) => {
            if (err) return res.status(500).json({ message: 'Error checking permission' });

            if (existing) {
                return res.status(400).json({ message: 'Another permission with same module and action exists' });
            }

            db.run(
                `UPDATE permissions SET module = ?, action = ? WHERE id = ?`,
                [module, action, id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Error updating permission' });
                    if (this.changes === 0) {
                        return res.status(404).json({ message: 'Permission not found' });
                    }
                    res.json({ id, module, action });
                }
            );
        }
    );
};

// DELETE permission
exports.deletePermission = (req, res) => {
    db.run('DELETE FROM permissions WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ deleted: this.changes });
    });
};

// ASSIGN permissions to a role
exports.assignPermissionsToRole = (req, res) => {
    const roleId = req.params.roleId;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0)
        return res.status(400).json({ message: 'permissionIds array required' });

    const placeholders = permissionIds.map(() => '(?, ?)').join(',');
    const values = permissionIds.flatMap((id) => [roleId, id]);

    db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing role permissions' });

        db.run(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${placeholders}`, values, function (err) {
            if (err) return res.status(500).json({ message: 'Error assigning permissions to role' });
            res.json({ assigned: this.changes });
        });
    });
};

// GET all permissions assigned to a role
exports.getRolePermissions = (req, res) => {
    const roleId = req.params.roleId;

    const sql = `
    SELECT p.id, p.module, p.action FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    WHERE rp.role_id = ?
  `;

    db.all(sql, [roleId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching role permissions' });
        res.json(rows);
    });
};
