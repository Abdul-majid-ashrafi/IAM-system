const express = require('express');
const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
} = require('../controllers/roleController');

const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();

router.get('/', checkPermission('Roles', 'read'), getRoles);
router.get('/:id', checkPermission('Roles', 'read'), getRole);
router.post('/', checkPermission('Roles', 'create'), createRole);
router.put('/:id', checkPermission('Roles', 'update'), updateRole);
router.delete('/:id', checkPermission('Roles', 'delete'), deleteRole);

module.exports = router;
