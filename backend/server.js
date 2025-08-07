// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const roleRoutes = require('./routes/roleRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const accessRoutes = require('./routes/accessRoutes');
const { initDB } = require('./database');
const { authenticateJWT } = require('./middlewares/authMiddleware');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Init DB
initDB();

// Public routes
app.use('/api', authRoutes);

// Protected routes
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/groups', authenticateJWT, groupRoutes);
app.use('/api/roles', authenticateJWT, roleRoutes);
app.use('/api/modules', authenticateJWT, moduleRoutes);
app.use('/api/permissions', authenticateJWT, permissionRoutes);
app.use('/api/access', authenticateJWT, accessRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
