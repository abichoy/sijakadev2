const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/profile', [verifyToken], controller.getProfile);
router.put('/profile', [verifyToken], (req, res, next) => {
    controller.uploadMiddleware(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        next();
    });
}, controller.updateProfile);

module.exports = router;
