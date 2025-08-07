const express = require('express');
const {
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionsToRole,
    getRolePermissions
} = require('../controllers/permissionController');

const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();

router.get('/', checkPermission('Permissions', 'read'), getPermissions);
router.get('/:id', checkPermission('Permissions', 'read'), getPermission);
router.post('/', checkPermission('Permissions', 'create'), createPermission);
router.put('/:id', checkPermission('Permissions', 'update'), updatePermission);
router.delete('/:id', checkPermission('Permissions', 'delete'), deletePermission);

router.post('/assign/:roleId', checkPermission('Permissions', 'update'), assignPermissionsToRole);
router.get('/role/:roleId', checkPermission('Permissions', 'read'), getRolePermissions);

module.exports = router;
