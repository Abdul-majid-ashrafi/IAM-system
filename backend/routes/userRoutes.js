const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser, getUserGroups } = require('../controllers/userController');

const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();

// Read operat
router.get('/', checkPermission('Users', 'read'), getUsers);
router.get('/:id', checkPermission('Users', 'read'), getUser);
router.get('/:id/groups', checkPermission('Users', 'read'), getUserGroups);

// Modify opert
router.post('/', checkPermission('Users', 'create'), createUser);
router.put('/:id', checkPermission('Users', 'update'), updateUser);
router.delete('/:id', checkPermission('Users', 'delete'), deleteUser);

module.exports = router;
