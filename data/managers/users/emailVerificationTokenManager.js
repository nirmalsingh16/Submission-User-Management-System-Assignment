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
 * Create or replace the email verification token of a user
 * (a user can have only one token, so an existing one is overwritten)
 */
module.exports.upsertEmailVerificationToken = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    EmailVerificationTokens.findOne({ where: { user_id: payload.user_id }, ...options })
      .then((existingToken) => {
        if (existingToken) {
          return existingToken.update(
            { token: payload.token, expires_at: payload.expires_at },
            options
          );
        }

        return EmailVerificationTokens.create(payload, options);
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
