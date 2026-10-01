const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    logging: false,   // sql queries will not print on terminal

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),

    dialect: 'postgres',

    define: {
      freezeTableName: true,   // table name will be same as model name
      schema: 'public'
    },

    pool: {
      max: 10, // maximum number of connections in pool
      min: 0,
      acquire: 20000,   // maximum time in ms that pool will try to get connection before throwing error
      idle: 20000  // maximum time in ms that a connection can be idle before being released
    }
  }
);


module.exports.sequelize = sequelize;