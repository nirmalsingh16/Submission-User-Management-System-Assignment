const { PasswordResetTokens } = require('../../models/users/passwordResetTokenModel');

/**
 * Create password reset token
 */
module.exports.createPasswordResetToken = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    PasswordResetTokens.create(payload, options)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get single password reset token
 */
module.exports.getPasswordResetToken = (searchQuery) => {
  return new Promise((resolve, reject) => {
    PasswordResetTokens.findOne(searchQuery)
      .then((result) => {
        resolve(result ? JSON.parse(JSON.stringify(result)) : null);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Delete password reset token(s)
 */
module.exports.deletePasswordResetToken = (searchQuery) => {
  return new Promise((resolve, reject) => {
    PasswordResetTokens.destroy(searchQuery)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
