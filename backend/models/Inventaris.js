const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventaris = sequelize.define('Inventaris', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    kode_jaket: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    jenis: {
        type: DataTypes.ENUM('dewasa', 'anak'),
        allowNull: false
    },
    kondisi: {
        type: DataTypes.ENUM('baik', 'rusak', 'hilang', 'dipinjam'),
        defaultValue: 'baik'
    },
    lokasi_penyimpanan: {
        type: DataTypes.STRING(100),
        defaultValue: 'Jembatan Baru'
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'inventaris',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Inventaris;
