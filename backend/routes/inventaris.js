const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventarisController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', [verifyToken], controller.getAll);
router.post('/', [verifyToken, isAdmin], controller.create);
router.put('/:id', [verifyToken, isAdmin], controller.update);
router.delete('/:id', [verifyToken, isAdmin], controller.delete);

module.exports = router;
