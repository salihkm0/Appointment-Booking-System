const express = require('express');
const router = express.Router();
const { auth, isProvider } = require('../middleware/auth');
const {createService} = require('../controllers/service/createService');
const {getMyServices} = require('../controllers/service/getMyServices');
const {updateService} = require('../controllers/service/updateService');
const {deleteService} = require('../controllers/service/deleteService');
const {getAllServices} = require('../controllers/service/getAllServices');

//! Provider routes
router.post('/', auth, isProvider, createService);
router.get('/my-services', auth, isProvider, getMyServices);
router.put('/:id', auth, isProvider, updateService);
router.delete('/:id', auth, isProvider, deleteService);

//! Public routes
router.get('/', getAllServices);

module.exports = router;