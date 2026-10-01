const { EmailVerificationTokens } = require('../../models/users/emailVerificationTokenModel');

/**
 * Create email verification token
 */
module.exports.createEmailVerificationToken = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    EmailVerificationTokens.create(payload, options)
      .then((result) => {
        resolve(JSON.parse(JSON.stringify(result)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Get single email verification token
 */
module.exports.getEmailVerificationToken = (searchQuery) => {
  return new Promise((resolve, reject) => {
    EmailVerificationTokens.findOne(searchQuery)
      .then((result) => {
        resolve(result ? JSON.parse(JSON.stringify(result)) : null);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Delete email verification token(s)
 */
module.exports.deleteEmailVerificationToken = (searchQuery) => {
  return new Promise((resolve, reject) => {
    EmailVerificationTokens.destroy(searchQuery)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
