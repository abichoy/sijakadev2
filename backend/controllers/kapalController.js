const { Kapal, Nakhoda } = require('../models');

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
        const newRecord = await Kapal.create(req.body);
        res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const record = await Kapal.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Kapal not found' });
        
        await record.update(req.body);
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const record = await Kapal.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Kapal not found' });
        
        await record.destroy();
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
