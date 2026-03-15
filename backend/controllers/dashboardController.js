const { Inventaris, TransaksiPeminjaman, Nakhoda, Kapal } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getStok = async (req, res) => {
    try {
        const stok = await Inventaris.findAll({
            attributes: ['kondisi', 'jenis', [fn('COUNT', col('id')), 'jumlah']],
            group: ['kondisi', 'jenis']
        });
        res.json({ success: true, data: stok });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPeminjamanHariIni = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const count = await TransaksiPeminjaman.count({
            where: {
                waktu_checkout: {
                    [Op.gte]: startOfDay
                }
            }
        });
        res.json({ success: true, data: count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getKepatuhan = async (req, res) => {
    try {
        const violations = await TransaksiPeminjaman.findAll({
            where: {
                status: 'dipinjam',
                batas_waktu: {
                    [Op.lt]: new Date()
                }
            },
            include: [{ 
                model: Nakhoda, as: 'Nakhoda',
                include: [{ model: Kapal, as: 'Kapal' }] 
            }]
        });
        
        res.json({ success: true, data: violations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
