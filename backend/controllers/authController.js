const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const SECRET = process.env.JWT_SECRET || 'secret';

exports.register = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    // if (username === 'admin')
    //     return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
            if (err) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        }
    );
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    // // Special-case admin bypass (DEV ONLY)
    // if (username === 'admin' && password === 'admin123') {
    //     // Create a fake "user" object for token payload.
    //     // Use a reserved id (e.g., 0) or some meaningful admin id.
    //     const adminUser = { id: 0, username: 'admin' };

    //     const token = jwt.sign({ userId: adminUser.id, username: adminUser.username }, SECRET, { expiresIn: '1h' });

    //     return res.json({ token });
    // }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user)
            return res.status(401).json({ message: 'Invalid username or password' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid username or password' });

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};
