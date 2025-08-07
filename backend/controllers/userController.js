const bcrypt = require('bcryptjs');
const { db } = require('../database');

// GET all users
exports.getUsers = (req, res) => {
    db.all('SELECT id, username FROM users', [], (err, users) => {
        if (err) return res.status(500).json({ message: 'Error fetching users' });
        res.json(users);
    });
};

// GET single user by ID
exports.getUser = (req, res) => {
    db.get('SELECT id, username FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err || !user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
};

// CREATE user
exports.createUser = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    // if (username === 'admin')
    //     return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) return res.status(400).json({ message: 'Username must be unique' });
        res.status(201).json({ id: this.lastID });
    });
};

// UPDATE user
exports.updateUser = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    db.run(
        'UPDATE users SET username = ?, password = COALESCE(?, password) WHERE id = ?',
        [username, hashedPassword, req.params.id],
        function (err) {
            if (err) return res.status(400).json({ message: 'Update failed' });
            res.json({ updated: this.changes });
        }
    );
};

// DELETE user
exports.deleteUser = (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ deleted: this.changes });
    });
};

// GET groups for a user
exports.getUserGroups = (req, res) => {
    const userId = req.params.id;
    const sql = `
    SELECT g.id, g.name FROM groups g
    JOIN group_users gu ON gu.group_id = g.id
    WHERE gu.user_id = ?
  `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching user groups' });
        res.json(rows);
    });
};
