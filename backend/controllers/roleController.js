const { db } = require('../database');

// GET all roles
exports.getRoles = (req, res) => {
    db.all('SELECT * FROM roles', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching roles' });
        res.json(rows);
    });
};

// GET single role
exports.getRole = (req, res) => {
    db.get('SELECT * FROM roles WHERE id = ?', [req.params.id], (err, role) => {
        if (err || !role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    });
};

// CREATE role
exports.createRole = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Role name is required' });

    db.get(`SELECT * FROM roles WHERE name = ?`, [name], (err, existing) => {
        if (err) return res.status(500).json({ message: 'Error checking role' });

        if (existing) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        db.run(`INSERT INTO roles (name) VALUES (?)`, [name], function (err) {
            if (err) return res.status(500).json({ message: 'Error creating role' });
            res.status(201).json({ id: this.lastID, name });
        });
    });
};

// UPDATE role
exports.updateRole = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Role name is required' });

    db.get(`SELECT * FROM roles WHERE name = ? AND id != ?`, [name, id], (err, existing) => {
        if (err) return res.status(500).json({ message: 'Error checking role' });

        if (existing) {
            return res.status(400).json({ message: 'Role name already in use' });
        }

        db.run(`UPDATE roles SET name = ? WHERE id = ?`, [name, id], function (err) {
            if (err) return res.status(500).json({ message: 'Error updating role' });
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.json({ id, name });
        });
    });
};

// DELETE role
exports.deleteRole = (req, res) => {
    db.run('DELETE FROM roles WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ deleted: this.changes });
    });
};
