/**
 * Email verification template
 */
module.exports = ({ firstName, verificationLink }) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Verify Your Email</title>
      </head>

      <body>
        <h2>Hello ${firstName},</h2>

        <p>
          Thank you for registering with our User Management System.
        </p>

        <p>
          Please click the button below to verify your email address.
        </p>

        <a href="${verificationLink}">
          Verify Email
        </a>

        <p>
          This verification link will expire in 24 hours.
        </p>

        <p>
          If you did not create this account, you can ignore this email.
        </p>
      </body>
    </html>
  `;
};