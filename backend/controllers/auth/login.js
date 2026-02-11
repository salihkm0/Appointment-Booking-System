const User = require('../../models/User');
const jwt = require('jsonwebtoken');

//! Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //------------- Find user -----------------------
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //--------------- Check password -------------
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //----------- Generate token ------------------
        const token = generateToken(user._id);

        res.json({
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