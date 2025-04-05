const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        token: { type: DataTypes.STRING },
        expires: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdByIp: { type: DataTypes.STRING },
        revoked: { type: DataTypes.DATE },
        revokedByIp: { type: DataTypes.STRING },
        replacedByToken: { type: DataTypes.STRING },
        isExpired: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.expires ? Date.now() >= this.expires.getTime() : false;
            }
        },
        isActive: {
            type: DataTypes.VIRTUAL,
            get() {
                return !this.revoked && !this.isExpired;
            }
        }
    };

    const options = {
        timestamps: false // disables Sequelize createdAt and updatedAt
    };

    return sequelize.define('RefreshToken', attributes, options);
}
