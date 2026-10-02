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
 * Create or replace the password reset token of a user
 * (a user can have only one token, so an existing one is overwritten)
 */
module.exports.upsertPasswordResetToken = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    PasswordResetTokens.findOne({ where: { user_id: payload.user_id }, ...options })
      .then((existingToken) => {
        if (existingToken) {
          return existingToken.update(
            { token: payload.token, expires_at: payload.expires_at },
            options
          );
        }

        return PasswordResetTokens.create(payload, options);
      })
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
