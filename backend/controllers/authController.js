const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer setup for avatar uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/avatars';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (jpg, png, webp) yang diizinkan'));
        }
    }
});

exports.uploadMiddleware = upload.single('avatar');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordIsValid) return res.status(401).json({ success: false, message: 'Invalid Password' });

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'sijaka_secret',
            { expiresIn: 86400 }
        );

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                avatar_url: user.avatar_url || null,
                accessToken: token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const { username, current_password, new_password } = req.body;
        const updates = {};

        // Update username
        if (username && username !== user.username) {
            const existing = await User.findOne({ where: { username } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
            }
            updates.username = username;
        }

        // Update password
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ success: false, message: 'Password saat ini harus diisi' });
            }
            const isValid = bcrypt.compareSync(current_password, user.password_hash);
            if (!isValid) {
                return res.status(400).json({ success: false, message: 'Password saat ini salah' });
            }
            updates.password_hash = bcrypt.hashSync(new_password, 8);
        }

        // Update avatar
        if (req.file) {
            // Remove old avatar file if exists
            if (user.avatar_url) {
                const oldPath = path.join(__dirname, '../../', user.avatar_url.replace('http://localhost:3000/', ''));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updates.avatar_url = `http://localhost:3000/uploads/avatars/${req.file.filename}`;
        }

        await user.update(updates);

        // Return fresh token with updated username
        const newUsername = updates.username || user.username;
        const token = jwt.sign(
            { id: user.id, role: user.role, username: newUsername },
            process.env.JWT_SECRET || 'sijaka_secret',
            { expiresIn: 86400 }
        );

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: {
                id: user.id,
                username: newUsername,
                role: user.role,
                avatar_url: updates.avatar_url || user.avatar_url || null,
                accessToken: token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'role', 'avatar_url', 'created_at']
        });
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
