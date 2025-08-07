const express = require('express');
const { getMyPermissions, simulateAction } = require('../controllers/accessController');

const router = express.Router();

router.get('/me/permissions', getMyPermissions);
router.post('/simulate-action', simulateAction);

module.exports = router;
