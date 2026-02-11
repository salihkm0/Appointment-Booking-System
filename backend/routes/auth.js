const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {register} = require('../controllers/auth/register')
const {login} = require('../controllers/auth/login')
const {getMe} = require('../controllers/auth/getMe')

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;