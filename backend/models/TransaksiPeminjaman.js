const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Nakhoda = require('./Nakhoda');
const Kapal = require('./Kapal');

const TransaksiPeminjaman = sequelize.define('TransaksiPeminjaman', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nakhoda_id: {
        type: DataTypes.UUID,
        references: {
            model: Nakhoda,
            key: 'id'
        }
    },
    kapal_id: {
        type: DataTypes.UUID,
        references: {
            model: Kapal,
            key: 'id'
        }
    },
    waktu_checkout: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    waktu_checkin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    jumlah_dewasa_dipinjam: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jumlah_anak_dipinjam: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ttd_digital: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('dipinjam', 'selesai', 'terlambat'),
        defaultValue: 'dipinjam'
    },
    batas_waktu: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'transaksi_peminjaman',
    timestamps: false
});

module.exports = TransaksiPeminjaman;
