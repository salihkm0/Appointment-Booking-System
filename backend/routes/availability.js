const express = require('express');
const router = express.Router();
const { auth, isProvider } = require('../middleware/auth');
const {setAvailability} = require('../controllers/availability/setAvailability');
const {getMyAvailability} = require('../controllers/availability/getMyAvailability');
const {getAvailableSlots} = require('../controllers/availability/getAvailableSlots');
const {blockDate} = require('../controllers/availability/blockDate');

//! Provider routes
router.post('/set', auth, isProvider, setAvailability);
router.post('/block-date', auth, isProvider, blockDate);
router.get('/my-availability', auth, isProvider, getMyAvailability);

//! Public route (for getting available slots)
router.get('/available-slots', getAvailableSlots);

module.exports = router;