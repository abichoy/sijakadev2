const { Nakhoda, Kapal, TransaksiPeminjaman } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const data = await Nakhoda.findAll({
            include: [
                { model: Kapal, as: 'Kapal' },
                { 
                    model: TransaksiPeminjaman, 
                    required: false,
                    where: { status: 'dipinjam' }
                }
            ]
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Nakhoda.findByPk(req.params.id, {
            include: [
                { model: Kapal, as: 'Kapal' },
                { 
                    model: TransaksiPeminjaman, 
                    required: false,
                    where: { status: 'dipinjam' }
                }
            ]
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
        
        // Handle empty strings for optional/nullable fields
        if (data.kapal_id === '') data.kapal_id = null;
        if (data.kontak === '') data.kontak = null;

        if (req.file) {
            data.foto = `/uploads/${req.file.filename}`;
        } else {
            // Default photo if none provided
            data.foto = '/uploads/nakhoda_default.png';
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

        // Handle empty strings for optional/nullable fields
        if (data.kapal_id === '') data.kapal_id = null;
        if (data.kontak === '') data.kontak = null;

        if (req.file) {
            data.foto = `/uploads/${req.file.filename}`;
        } else if (!record.foto) {
            // If it didn't have a photo and still doesn't, use default
            data.foto = '/uploads/nakhoda_default.png';
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
