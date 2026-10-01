/**
 * Password reset email template
 */
module.exports = ({ firstName, resetLink }) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Reset Your Password</title>
      </head>

      <body>
        <h2>Hello ${firstName},</h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Please click the button below to set a new password.
        </p>

        <p>
          <a href="${resetLink}">
            Reset Password
          </a>
        </p>

        <p>
          This password reset link will expire in 1 hour.
        </p>

        <p>
          If you did not request a password reset, you can ignore this email.
        </p>
      </body>
    </html>
  `;
};