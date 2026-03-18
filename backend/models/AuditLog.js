const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'DELETE_BLOCKED'),
        allowNull: false
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    target_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    target_label: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    detail: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'audit_logs',
    timestamps: false
});

module.exports = AuditLog;
