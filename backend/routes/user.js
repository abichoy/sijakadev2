const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', [verifyToken, isAdmin], controller.getAllUsers);
router.post('/', [verifyToken, isAdmin], controller.createUser);
router.put('/:id', [verifyToken, isAdmin], controller.updateUser);
router.delete('/:id', [verifyToken, isAdmin], controller.deleteUser);

module.exports = router;
