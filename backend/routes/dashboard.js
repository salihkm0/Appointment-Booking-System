const express = require('express');
const router = express.Router();
const { auth, isProvider } = require('../middleware/auth');
const {
    getUserDashboard,
    getUserDashboardTrends
} = require('../controllers/dashboard/userDashboard');
const {
    getProviderDashboard,
    getProviderDashboardTrends,
    getProviderDashboardOverview
} = require('../controllers/dashboard/providerDashboard');

//! User Dashboard Routes
router.get('/user', auth, getUserDashboard);
router.get('/user/trends', auth, getUserDashboardTrends);

//! Provider Dashboard Routes
router.get('/provider', auth, isProvider, getProviderDashboard);
router.get('/provider/trends', auth, isProvider, getProviderDashboardTrends);
router.get('/provider/overview', auth, isProvider, getProviderDashboardOverview);

module.exports = router;