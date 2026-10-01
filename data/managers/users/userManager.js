const { Users } = require('../../models/users/userModel');

/**
 * Create user profile
 */
module.exports.createUserProfile = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    Users.create(payload, options)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Update user profile
 */
module.exports.updateUserProfile = (updateQuery, searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.update(updateQuery, searchQuery)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get single user profile
 */
module.exports.getUserProfile = (searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.findOne(searchQuery)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get user by primary key
 */
module.exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    Users.findByPk(id)
      .then((result) => {
        resolve(result ? JSON.parse(JSON.stringify(result)) : null);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get user list
 */
module.exports.getUserList = (searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.findAll(searchQuery)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get user list with count
 */
module.exports.getUserListAndCount = (searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.findAndCountAll(searchQuery)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get user count
 */
module.exports.getUserCount = (searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.count(searchQuery)
      .then((result) => {
        resolve(result || 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Delete user profile
 */
module.exports.deleteUserProfile = (searchQuery) => {
  return new Promise((resolve, reject) => {
    Users.destroy(searchQuery)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};