const { db } = require('../database');

// GET all modules
exports.getModules = (req, res) => {
    db.all('SELECT * FROM modules', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching modules' });
        res.json(rows);
    });
};

// GET one module
exports.getModule = (req, res) => {
    db.get('SELECT * FROM modules WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Module not found' });
        res.json(row);
    });
};

// CREATE module
exports.createModule = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Module name is required' });

    db.get(`SELECT * FROM modules WHERE name = ?`, [name], (err, existing) => {
        if (err) return res.status(500).json({ message: 'Error checking module' });

        if (existing) {
            return res.status(400).json({ message: 'Same name module already exists' });
        }

        db.run(`INSERT INTO modules (name) VALUES (?)`, [name], function (err) {
            if (err) return res.status(500).json({ message: 'Error creating module' });
            res.status(201).json({ id: this.lastID, name });
        });
    });
};

// UPDATE module
exports.updateModule = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Module name is required' });

    db.get(`SELECT * FROM modules WHERE name = ? AND id != ?`, [name, id], (err, existing) => {
        if (err) return res.status(500).json({ message: 'Error checking module' });

        if (existing) {
            return res.status(400).json({ message: 'Module name already in use' });
        }

        db.run(`UPDATE modules SET name = ? WHERE id = ?`, [name, id], function (err) {
            if (err) return res.status(500).json({ message: 'Error updating module' });
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.json({ id, name });
        });
    });
};

// DELETE module
exports.deleteModule = (req, res) => {
    db.run('DELETE FROM modules WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ deleted: this.changes });
    });
};
