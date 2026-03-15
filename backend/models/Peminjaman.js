const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Nakhoda = require('./Nakhoda');

const Peminjaman = sequelize.define('Peminjaman', {
    id_transaksi: {
        type: DataTypes.STRING(36), // UUID or Auto Inc String
        primaryKey: true
    },
    id_nakhoda: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: Nakhoda,
            key: 'id_nakhoda'
        }
    },
    tgl_pinjam: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    tgl_kembali: {
        type: DataTypes.DATE,
        allowNull: true
    },
    jumlah_dewasa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    jumlah_anak: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ttd_nakhoda: {
        type: DataTypes.TEXT, // Base64 signature
        allowNull: true
    }
}, {
    tableName: 'peminjaman',
    timestamps: true
});

module.exports = Peminjaman;
