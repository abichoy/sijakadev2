const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jaket = sequelize.define('Jaket', {
    id_jaket: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    tipe: {
        type: DataTypes.ENUM('dewasa', 'anak'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('layak', 'rusak', 'dipinjam'),
        allowNull: false,
        defaultValue: 'layak'
    },
    lokasi: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    keterangan_rusak: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'jaket',
    timestamps: true
});

module.exports = Jaket;
