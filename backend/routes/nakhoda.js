const express = require('express');
const router = express.Router();
const controller = require('../controllers/nakhodaController');
const kartuController = require('../controllers/kartuController');
const multer = require('multer');
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

router.get('/', [verifyToken], controller.getAll);
router.get('/:id', [verifyToken], controller.getById);
router.get('/:id/kartu', [verifyToken], kartuController.generateKartuPDF);
router.get('/by-qr/:qrId', [verifyToken], controller.getByQRId);
router.post('/', [verifyToken, isAdmin, upload.single('foto')], controller.create);
router.put('/:id', [verifyToken, isAdmin, upload.single('foto')], controller.update);
router.delete('/:id', [verifyToken, isAdmin], controller.delete);

module.exports = router;
