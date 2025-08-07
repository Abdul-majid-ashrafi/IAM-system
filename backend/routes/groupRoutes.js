const express = require('express');
const {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    assignUsersToGroup,
    getGroupRoles,
    getGroupUsers,
    assignRolesToGroup
} = require('../controllers/groupController');

const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();

router.get('/', checkPermission('Groups', 'read'), getGroups);
router.get('/:id', checkPermission('Groups', 'read'), getGroup);
router.post('/', checkPermission('Groups', 'create'), createGroup);
router.put('/:id', checkPermission('Groups', 'update'), updateGroup);
router.delete('/:id', checkPermission('Groups', 'delete'), deleteGroup);

router.post('/:groupId/users', checkPermission('Groups', 'update'), assignUsersToGroup);
router.get('/:groupId/users', checkPermission('Groups', 'read'), getGroupUsers);

router.post('/:groupId/roles', checkPermission('Groups', 'update'), assignRolesToGroup);
router.get('/:groupId/roles', checkPermission('Groups', 'read'), getGroupRoles);

module.exports = router;
