const { db } = require('../database');

// GET all groups
exports.getGroups = (req, res) => {
    db.all('SELECT * FROM groups', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching groups' });
        res.json(rows);
    });
};

// GET single group
exports.getGroup = (req, res) => {
    db.get('SELECT * FROM groups WHERE id = ?', [req.params.id], (err, group) => {
        if (err || !group) return res.status(404).json({ message: 'Group not found' });
        res.json(group);
    });
};

// CREATE group
exports.createGroup = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    db.run('INSERT INTO groups (name) VALUES (?)', [name], function (err) {
        if (err) return res.status(400).json({ message: 'Group name must be unique' });
        res.status(201).json({ id: this.lastID });
    });
};

// UPDATE group
exports.updateGroup = (req, res) => {
    const { name } = req.body;
    db.run('UPDATE groups SET name = ? WHERE id = ?', [name, req.params.id], function (err) {
        if (err) return res.status(400).json({ message: 'Update failed' });
        res.json({ updated: this.changes });
    });
};

// DELETE group
exports.deleteGroup = (req, res) => {
    db.run('DELETE FROM groups WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ deleted: this.changes });
    });
};

// ASSIGN users to a group
exports.assignUsersToGroup = (req, res) => {
    const groupId = req.params.groupId;
    const { userIds } = req.body; // expects array of userIds

    if (!Array.isArray(userIds) || userIds.length === 0)
        return res.status(400).json({ message: 'userIds array required' });

    const placeholders = userIds.map(() => '(?, ?)').join(',');
    const values = userIds.flatMap((id) => [groupId, id]);

    db.run(`DELETE FROM group_users WHERE group_id = ?`, [groupId], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing group users' });

        db.run(`INSERT INTO group_users (group_id, user_id) VALUES ${placeholders}`, values, function (err) {
            if (err) return res.status(500).json({ message: 'Error assigning users to group' });
            res.json({ assigned: this.changes });
        });
    });
};

// GET all users in a group
exports.getGroupUsers = (req, res) => {
    const groupId = req.params.groupId;

    const sql = `
    SELECT u.id, u.username FROM users u
    JOIN group_users gu ON gu.user_id = u.id
    WHERE gu.group_id = ?
  `;

    db.all(sql, [groupId], (err, users) => {
        if (err) return res.status(500).json({ message: 'Error fetching group users' });
        res.json(users);
    });
};

// ASSIGN roles to group
exports.assignRolesToGroup = (req, res) => {
    const groupId = req.params.groupId;
    const { roleIds } = req.body; // expects array of role IDs

    if (!Array.isArray(roleIds) || roleIds.length === 0)
        return res.status(400).json({ message: 'roleIds array required' });

    const placeholders = roleIds.map(() => '(?, ?)').join(',');
    const values = roleIds.flatMap((id) => [groupId, id]);

    db.run(`DELETE FROM group_roles WHERE group_id = ?`, [groupId], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing group roles' });

        db.run(`INSERT INTO group_roles (group_id, role_id) VALUES ${placeholders}`, values, function (err) {
            if (err) return res.status(500).json({ message: 'Error assigning roles to group' });
            res.json({ assigned: this.changes });
        });
    });
};

// GET roles assigned to group
exports.getGroupRoles = (req, res) => {
    const groupId = req.params.groupId;

    const sql = `
      SELECT r.id, r.name FROM roles r
      JOIN group_roles gr ON gr.role_id = r.id
      WHERE gr.group_id = ?
    `;

    db.all(sql, [groupId], (err, roles) => {
        if (err) return res.status(500).json({ message: 'Error fetching group roles' });
        res.json(roles);
    });
};
