const express = require('express');
const router = express.Router();
const { auth, isProvider } = require('../middleware/auth');
const {getProviderReports} = require('../controllers/report/getProviderReports');
const {getUserReports} = require('../controllers/report/getUserReports');

router.get('/user', auth, getUserReports);
router.get('/provider', auth, isProvider, getProviderReports);

module.exports = router;