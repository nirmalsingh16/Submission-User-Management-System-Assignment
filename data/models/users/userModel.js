const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../connection/connection');

class Users extends Model {}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    profile_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    profile_image_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'USER'
    },

    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    }
  },
  {
    sequelize,
    modelName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = {Users};