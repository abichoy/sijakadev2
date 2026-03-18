const express = require('express');
const router = express.Router();
const controller = require('../controllers/peminjamanController');
const { verifyToken } = require('../middleware/auth');

router.post('/checkout', [verifyToken], controller.checkout);
router.post('/checkin/:id', [verifyToken], controller.checkin);
router.get('/aktif', [verifyToken], controller.getAktif);
router.get('/history', [verifyToken], controller.getAll);

module.exports = router;
