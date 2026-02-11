const express = require('express');
const router = express.Router();
const { auth, isProvider } = require('../middleware/auth');
const {bookAppointment} = require('../controllers/appointment/bookAppointment');
const {getMyAppointments} = require('../controllers/appointment/getMyAppointments');
const {cancelAppointment} = require('../controllers/appointment/cancelAppointment');
const {getProviderAppointments} = require('../controllers/appointment/getProviderAppointments');
const {updateAppointmentStatus} = require('../controllers/appointment/updateAppointmentStatus');

//! User routes
router.post('/book', auth, bookAppointment);
router.get('/my-appointments', auth, getMyAppointments);
router.put('/cancel/:id', auth, cancelAppointment);

//! Provider routes
router.get('/provider-appointments', auth, isProvider, getProviderAppointments);
router.put('/update-status/:id', auth, isProvider, updateAppointmentStatus);

module.exports = router;