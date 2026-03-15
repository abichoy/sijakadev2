const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TransaksiPeminjaman = require('./TransaksiPeminjaman');
const Inventaris = require('./Inventaris');

const TransaksiJaket = sequelize.define('TransaksiJaket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    transaksi_id: {
        type: DataTypes.UUID,
        references: {
            model: TransaksiPeminjaman,
            key: 'id'
        }
    },
    jaket_id: {
        type: DataTypes.UUID,
        references: {
            model: Inventaris,
            key: 'id'
        }
    },
    kondisi_saat_pinjam: {
        type: DataTypes.ENUM('baik', 'rusak', 'hilang'),
        defaultValue: 'baik'
    },
    kondisi_saat_kembali: {
        type: DataTypes.ENUM('baik', 'robek', 'berjamur', 'gesper_rusak'),
        allowNull: true
    },
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'transaksi_jaket',
    timestamps: false
});

module.exports = TransaksiJaket;
