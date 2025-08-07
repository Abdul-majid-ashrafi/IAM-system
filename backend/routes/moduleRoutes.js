const express = require('express');
const {
    getModules,
    getModule,
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');

const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();

router.get('/', checkPermission('Modules', 'read'), getModules);
router.get('/:id', checkPermission('Modules', 'read'), getModule);
router.post('/', checkPermission('Modules', 'create'), createModule);
router.put('/:id', checkPermission('Modules', 'update'), updateModule);
router.delete('/:id', checkPermission('Modules', 'delete'), deleteModule);

module.exports = router;
