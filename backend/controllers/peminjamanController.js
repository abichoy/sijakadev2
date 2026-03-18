const { TransaksiPeminjaman, TransaksiJaket, Inventaris, Kapal, Nakhoda, sequelize } = require('../models');

function hitungKebutuhanJaket(kapasitasPenumpang) {
    return {
        dewasa: Math.ceil(kapasitasPenumpang * 1.25),
        anak: Math.ceil(kapasitasPenumpang * 0.10)
    };
}

exports.checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nakhoda_id, kapal_id, jaket_dewasa_ids = [], jaket_anak_ids = [], ttd_digital } = req.body;
        
        // Check for active loan
        const activeLoan = await TransaksiPeminjaman.findOne({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { nakhoda_id: nakhoda_id },
                    { kapal_id: kapal_id }
                ],
                status: 'dipinjam'
            },
            include: [
                { model: Kapal, as: 'Kapal' },
                { model: Nakhoda, as: 'Nakhoda' }
            ]
        });

        if (activeLoan) {
            throw new Error(`Nama Kapal : ${activeLoan.Kapal?.nama_kapal || '-'}, Nama Nakhoda : ${activeLoan.Nakhoda?.nama_lengkap || '-'}, Jumlah jaket yang dipinjam [Dewasa : ${activeLoan.jumlah_dewasa_dipinjam}, Anak : ${activeLoan.jumlah_anak_dipinjam}] masih/belum mengembalikan jaket keselamatan/life jaket. kembalikan dulu baru dapat melakukan peminjaman lagi`);
        }

        const kapal = await Kapal.findByPk(kapal_id);

        if (!kapal) throw new Error('Kapal tidak ditemukan');

        const jumlah_dewasa = jaket_dewasa_ids.length;
        const jumlah_anak = jaket_anak_ids.length;

        const limit = hitungKebutuhanJaket(kapal.kapasitas_penumpang);
        if (jumlah_dewasa > limit.dewasa) throw new Error(`Jumlah jaket dewasa melebihi kuota maksimal (${limit.dewasa})`);
        if (jumlah_anak > limit.anak) throw new Error(`Jumlah jaket anak melebihi kuota maksimal (${limit.anak})`);

        // Get actual records to ensure they are available and in 'baik' condition
        const allJaketIds = [...jaket_dewasa_ids, ...jaket_anak_ids];
        if (allJaketIds.length === 0) throw new Error('Pilih setidaknya satu jaket untuk dipinjam');

        const availableJaket = await Inventaris.findAll({ 
            where: { id: allJaketIds, kondisi: 'baik' },
            transaction: t
        });

        if (availableJaket.length !== allJaketIds.length) {
             throw new Error('Beberapa jaket yang dipilih mungkin sudah tidak tersedia atau rusak');
        }

        const peminjaman = await TransaksiPeminjaman.create({
            nakhoda_id,
            kapal_id,
            jumlah_dewasa_dipinjam: jumlah_dewasa,
            jumlah_anak_dipinjam: jumlah_anak,
            ttd_digital,
            status: 'dipinjam',
            waktu_checkout: new Date(),
            batas_waktu: new Date(Date.now() + 72 * 60 * 60 * 1000) // batas 3 hari (72 jam)
        }, { transaction: t });

        const detailPromises = [];
        
        for (const j of availableJaket) {
            detailPromises.push(TransaksiJaket.create({
                transaksi_id: peminjaman.id,
                jaket_id: j.id,
                kondisi_saat_pinjam: 'baik'
            }, { transaction: t }));
            
            detailPromises.push(j.update({ kondisi: 'dipinjam' }, { transaction: t }));
        }

        await Promise.all(detailPromises);
        await t.commit();
        
        res.status(201).json({ success: true, data: peminjaman });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.checkin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const transId = req.params.id;
        const { kondisi_per_jaket } = req.body; 
        
        const peminjaman = await TransaksiPeminjaman.findByPk(transId);
        if (!peminjaman) throw new Error('Transaksi tidak ditemukan');
        if (peminjaman.status === 'selesai') throw new Error('Transaksi sudah selesai');
        
        for (const input of kondisi_per_jaket) {
            // Find transaction detail
            const detail = await TransaksiJaket.findOne({ 
                where: { transaksi_id: transId, jaket_id: input.jaket_id },
                transaction: t 
            });
            
            if (detail) {
                // Update transaction detail
                await detail.update({ 
                    kondisi_saat_kembali: input.kondisi, 
                    catatan: input.catatan 
                }, { transaction: t });

                // Find and Update master Inventaris record
                const inv = await Inventaris.findByPk(input.jaket_id, { transaction: t });
                if (inv) {
                    await inv.update({
                        kondisi: input.kondisi,
                        keterangan: input.catatan
                    }, { transaction: t });
                }
            }
        }

        await peminjaman.update({ status: 'selesai', waktu_checkin: new Date() }, { transaction: t });
        await t.commit();
        
        res.json({ success: true, message: 'Check-in berhasil' });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAktif = async (req, res) => {
    try {
        const aktif = await TransaksiPeminjaman.findAll({
            where: { status: 'dipinjam' },
            include: [
                { model: Kapal, as: 'Kapal' },
                { model: Nakhoda, as: 'Nakhoda' },
                { model: TransaksiJaket, as: 'DetailPeminjaman', include: [{ model: Inventaris, as: 'Inventaris' }] }
            ]
        });
        res.json({ success: true, data: aktif });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const history = await TransaksiPeminjaman.findAll({
            include: [
                { model: Kapal, as: 'Kapal' },
                { model: Nakhoda, as: 'Nakhoda' },
                { model: TransaksiJaket, as: 'DetailPeminjaman', include: [{ model: Inventaris, as: 'Inventaris' }] }
            ],
            order: [['waktu_checkout', 'DESC']]
        });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
