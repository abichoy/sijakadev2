const { Kapal, Nakhoda, AuditLog } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const data = await Kapal.findAll({
            include: [{ model: Nakhoda, as: 'Nakhoda' }]
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Kapal.findByPk(req.params.id, {
            include: [{ model: Nakhoda, as: 'Nakhoda' }]
        });
        if (!data) return res.status(404).json({ success: false, message: 'Kapal not found' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        // Check for duplicate ship name (case-insensitive)
        const existing = await Kapal.findOne({
            where: { nama_kapal: { [Op.like]: req.body.nama_kapal } }
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Kapal dengan nama "${existing.nama_kapal}" sudah terdaftar dalam database. Silakan gunakan nama kapal yang berbeda.`,
                isDuplicate: true,
                existingName: existing.nama_kapal
            });
        }

        const newRecord = await Kapal.create(req.body);

        // Audit log
        await AuditLog.create({
            user_id: req.user?.id || null,
            username: req.user?.username || 'system',
            action: 'CREATE',
            module: 'Kapal',
            target_id: newRecord.id,
            target_label: newRecord.nama_kapal,
            detail: `Menambahkan kapal baru: ${newRecord.nama_kapal} (Pemilik: ${newRecord.pemilik}, Alamat Pulau: ${newRecord.alamat_pulau}, Kapasitas: ${newRecord.kapasitas_penumpang})`,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const record = await Kapal.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Kapal not found' });
        
        const oldData = { nama_kapal: record.nama_kapal, pemilik: record.pemilik, alamat_pulau: record.alamat_pulau, kapasitas_penumpang: record.kapasitas_penumpang };
        await record.update(req.body);

        // Build change detail
        const changes = [];
        if (oldData.nama_kapal !== record.nama_kapal) changes.push(`nama_kapal: "${oldData.nama_kapal}" → "${record.nama_kapal}"`);
        if (oldData.pemilik !== record.pemilik) changes.push(`pemilik: "${oldData.pemilik}" → "${record.pemilik}"`);
        if (oldData.alamat_pulau !== record.alamat_pulau) changes.push(`alamat_pulau: "${oldData.alamat_pulau}" → "${record.alamat_pulau}"`);
        if (oldData.kapasitas_penumpang !== record.kapasitas_penumpang) changes.push(`kapasitas_penumpang: ${oldData.kapasitas_penumpang} → ${record.kapasitas_penumpang}`);

        // Audit log
        await AuditLog.create({
            user_id: req.user?.id || null,
            username: req.user?.username || 'system',
            action: 'UPDATE',
            module: 'Kapal',
            target_id: record.id,
            target_label: record.nama_kapal,
            detail: changes.length > 0 ? `Mengubah data kapal: ${changes.join(', ')}` : 'Tidak ada perubahan data',
            timestamp: new Date()
        });

        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const record = await Kapal.findByPk(req.params.id, {
            include: [{ model: Nakhoda, as: 'Nakhoda' }]
        });
        if (!record) return res.status(404).json({ success: false, message: 'Kapal not found' });
        
        // Check if kapal has related nakhoda
        if (record.Nakhoda) {
            // Audit log for blocked delete
            await AuditLog.create({
                user_id: req.user?.id || null,
                username: req.user?.username || 'system',
                action: 'DELETE_BLOCKED',
                module: 'Kapal',
                target_id: record.id,
                target_label: record.nama_kapal,
                detail: `Percobaan hapus kapal "${record.nama_kapal}" DITOLAK karena masih berelasi dengan Nakhoda: ${record.Nakhoda.nama_lengkap}`,
                timestamp: new Date()
            });

            return res.status(400).json({ 
                success: false, 
                message: `Kapal "${record.nama_kapal}" tidak dapat dihapus karena masih berelasi dengan Nakhoda: ${record.Nakhoda.nama_lengkap}. Hapus atau pindahkan data Nakhoda terlebih dahulu.`,
                hasRelation: true,
                relatedNakhoda: record.Nakhoda.nama_lengkap
            });
        }

        const deletedName = record.nama_kapal;
        const deletedId = record.id;
        await record.destroy();

        // Audit log
        await AuditLog.create({
            user_id: req.user?.id || null,
            username: req.user?.username || 'system',
            action: 'DELETE',
            module: 'Kapal',
            target_id: deletedId,
            target_label: deletedName,
            detail: `Menghapus kapal: ${deletedName}`,
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
