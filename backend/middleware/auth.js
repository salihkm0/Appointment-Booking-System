const jwt = require('jsonwebtoken');
const User = require('../models/User');

//! Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

//! Provider Role Middleware
const isProvider = (req, res, next) => {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ error: 'Access denied. Provider role required' });
    }
    next();
};

module.exports = { auth, isProvider };