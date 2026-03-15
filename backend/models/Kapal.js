const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kapal = sequelize.define('Kapal', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nama_kapal: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    pemilik: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    alamat_pulau: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    kapasitas_penumpang: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'kapal',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Kapal;
