const User = require('../../models/User');
const jwt = require('jsonwebtoken');

//! Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        //--------------- Check if user exists -------------------
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        //-------------- Create user ----------------------
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            phone
        });

        //----------------- Generate token ------------------
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


