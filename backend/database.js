const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Persistent DB file instead of in-memory for default admin 
const db = new sqlite3.Database('iam.db');

function initDB() {
  db.serialize(() => {
    // Create tables if not exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT,
      action TEXT,
      UNIQUE (module, action)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_users (
      group_id INTEGER,
      user_id INTEGER,
      PRIMARY KEY (group_id, user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_roles (
      group_id INTEGER,
      role_id INTEGER,
      PRIMARY KEY (group_id, role_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER,
      permission_id INTEGER,
      PRIMARY KEY (role_id, permission_id)
    )`);

    // --- Insert default admin if not exists ---
    const adminUsername = 'admin';
    const adminPassword = bcrypt.hashSync('admin123', 10);

    db.get(`SELECT id FROM users WHERE username = ?`, [adminUsername], (err, row) => {
      if (err) {
        console.error('Error checking admin user', err);
        return;
      }
      if (!row) {
        console.log('Creating default admin user...');

        // 1. Create admin user
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [adminUsername, adminPassword], function (err) {
          if (err) return console.error('Error inserting admin', err);
          const adminId = this.lastID;

          // 2. Create Admins group
          db.run(`INSERT OR IGNORE INTO groups (name) VALUES ('Admins')`, function (err) {
            if (err) return console.error(err);
            const groupId = this.lastID || 1;

            // Link admin to Admins group
            db.run(`INSERT OR IGNORE INTO group_users (group_id, user_id) VALUES (?, ?)`, [groupId, adminId]);

            // 3. Create SuperAdmin role
            db.run(`INSERT OR IGNORE INTO roles (name) VALUES ('SuperAdmin')`, function (err) {
              if (err) return console.error(err);
              const roleId = this.lastID || 1;

              // Link role to group
              db.run(`INSERT OR IGNORE INTO group_roles (group_id, role_id) VALUES (?, ?)`, [groupId, roleId]);

              // 4. Create modules
              const modules = ['Users', 'Groups', 'Roles', 'Modules', 'Permissions'];
              modules.forEach((m) => {
                db.run(`INSERT OR IGNORE INTO modules (name) VALUES (?)`, [m]);
              });

              // 5. Create all permissions and assign to SuperAdmin role
              const actions = ['create', 'read', 'update', 'delete'];
              modules.forEach((m) => {
                actions.forEach((a) => {
                  db.run(`INSERT OR IGNORE INTO permissions (module, action) VALUES (?, ?)`, [m, a]);
                });
              });

              // Assign all permissions to SuperAdmin role only if not already linked
              db.all(`SELECT id FROM permissions`, [], (err, perms) => {
                if (err) return console.error(err);
                perms.forEach((perm) => {
                  db.run(`INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, perm.id]);
                });
              });


              console.log('Default admin setup complete: username=admin password=admin123');
            });
          });
        });
      }
    });
  });
}

module.exports = {
  db,
  initDB
};
