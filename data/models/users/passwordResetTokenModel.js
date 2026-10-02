const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../connection/connection');
const { Users } = require('./userModel');

class PasswordResetTokens extends Model {}

PasswordResetTokens.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'PasswordResetTokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

/**
 * Associations
 * One user can have only one active password reset token,
 * and every token belongs to exactly one user.
 */
Users.hasOne(PasswordResetTokens, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

PasswordResetTokens.belongsTo(Users, {
  foreignKey: 'user_id'
});

module.exports = {PasswordResetTokens};
