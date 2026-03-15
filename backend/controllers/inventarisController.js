const { Inventaris } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.kondisi) whereClause.kondisi = req.query.kondisi;
        if (req.query.jenis) whereClause.jenis = req.query.jenis;

        const data = await Inventaris.findAll({ where: whereClause });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const record = await Inventaris.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const record = await Inventaris.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Inventaris not found' });
        
        await record.update(req.body);
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const record = await Inventaris.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Inventaris not found' });
        
        await record.destroy();
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
