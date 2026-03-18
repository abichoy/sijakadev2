const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Validate
        if (!username || !password || !role) {
            return res.status(400).json({ success: false, message: 'Harap lengkapi semua data' });
        }

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).json({ success: false, message: 'Username sudah digunakan' });

        const user = await User.create({
            username,
            password_hash: bcrypt.hashSync(password, 8),
            role
        });

        res.status(201).json({ success: true, message: 'User berhasil dibuat', data: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const updates = { username, role };
        if (password) {
            updates.password_hash = bcrypt.hashSync(password, 8);
        }

        // Check if username unique
        if (username && username !== user.username) {
            const existing = await User.findOne({ where: { username } });
            if (existing) return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
        }

        await user.update(updates);
        res.json({ success: true, message: 'User berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cannot delete self
        if (id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        await user.destroy();
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
