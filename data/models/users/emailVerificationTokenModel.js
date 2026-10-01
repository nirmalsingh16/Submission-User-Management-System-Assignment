const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../connection/connection');
const { Users } = require('./userModel');

class EmailVerificationTokens extends Model {}

EmailVerificationTokens.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelName: 'EmailVerificationTokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

/**
 * Associations
 * One user can have many email verification tokens (over time),
 * but every token belongs to exactly one user.
 */
Users.hasMany(EmailVerificationTokens, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

EmailVerificationTokens.belongsTo(Users, {
  foreignKey: 'user_id'
});

module.exports = {EmailVerificationTokens};
