const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Peminjaman = require('./Peminjaman');
const Jaket = require('./Jaket');

const DetailPeminjaman = sequelize.define('DetailPeminjaman', {
    id_detail: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_transaksi: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: Peminjaman,
            key: 'id_transaksi'
        }
    },
    id_jaket: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: Jaket,
            key: 'id_jaket'
        }
    },
    kondisi_saat_kembali: {
        type: DataTypes.ENUM('baik', 'robek', 'berjamur', 'gesper rusak', 'hilang'),
        allowNull: true
    }
}, {
    tableName: 'detail_peminjaman',
    timestamps: true
});

module.exports = DetailPeminjaman;
