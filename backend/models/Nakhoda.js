const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Kapal = require('./Kapal');

const Nakhoda = sequelize.define('Nakhoda', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nama_lengkap: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    foto: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    kontak: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    kapal_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Kapal,
            key: 'id'
        }
    },
    riwayat_kepatuhan: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'nakhoda',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Nakhoda;
