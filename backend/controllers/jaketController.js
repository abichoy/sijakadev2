const { Jaket } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.status) whereClause.status = req.query.status;
        if (req.query.lokasi) whereClause.lokasi = req.query.lokasi;

        const data = await Jaket.findAll({ where: whereClause });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const record = await Jaket.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const record = await Jaket.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Jaket not found' });
        
        const { status, keterangan_rusak } = req.body;
        await record.update({ status, keterangan_rusak });
        
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
