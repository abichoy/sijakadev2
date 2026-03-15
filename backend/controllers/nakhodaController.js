const { Nakhoda, Kapal } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const data = await Nakhoda.findAll({
            include: [{ model: Kapal, as: 'Kapal' }]
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Nakhoda.findByPk(req.params.id, {
            include: [{ model: Kapal, as: 'Kapal' }]
        });
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getByQRId = async (req, res) => {
    try {
        const data = await Nakhoda.findByPk(req.params.qrId, {
            include: [{ model: Kapal, as: 'Kapal' }]
        });
        if (!data) return res.status(404).json({ success: false, message: 'Nakhoda not found for this QR' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = Object.assign({}, req.body);
        if (req.file) {
            data.foto = `/uploads/${req.file.filename}`;
        }
        const record = await Nakhoda.create(data);
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const record = await Nakhoda.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Nakhoda not found' });
        
        const data = Object.assign({}, req.body);
        if (req.file) {
            data.foto = `/uploads/${req.file.filename}`;
        }
        await record.update(data);
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const record = await Nakhoda.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Nakhoda not found' });
        
        await record.destroy();
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
