const bcrypt = require('bcrypt');
const UserManager = require('../../data/managers/users/userManager');
const EmailVerificationTokenManager = require('../../data/managers/users/emailVerificationTokenManager');
const PasswordResetTokenManager = require('../../data/managers/users/passwordResetTokenManager');
const AuthService = require('../../services/authentication/authService');
const { Op } = require('sequelize');
const crypto = require('crypto');
const EmailService = require('../../services/emailService');
const verifyEmailTemplate = require('../../templates/emails/verifyEmail');
const resetPasswordTemplate = require('../../templates/emails/resetPassword');
const CloudinaryService = require('../../services/cloudinaryService');

/**
 * Create user profile
 */
module.exports.createUserProfile = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.first_name || !params.email || !params.password) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and password are required'
      });
    }

    const email = params.email.toLowerCase().trim();

    let searchQuery = {
      where: {
        email: email
      }
    };
    
    // Check whether email already exists
    const existingUser = await UserManager.getUserProfile(searchQuery);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(params.password, 10);

    const payload = {
      first_name: params.first_name.trim(),
      last_name: params.last_name ? params.last_name.trim() : null,
      email,
      password_hash: passwordHash,
      phone: params.phone || null,
      profile_image: null,

      // Public registration will always create USER
      role: 'USER',

      is_email_verified: false,
      status: 'ACTIVE'
    };

    const userProfile = await UserManager.createUserProfile(payload);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Token will expire after 24 hours
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerificationTokenManager.createEmailVerificationToken({
      user_id: userProfile.id,
      token: verificationToken,
      expires_at: verificationExpiresAt
    });

    // Create verification link
    const verificationLink =`${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Generate email HTML
    const emailHtml = verifyEmailTemplate({
      firstName: userProfile.first_name,
      verificationLink: verificationLink
    });

    // Send verification email
    await EmailService.sendEmail({
      from: process.env.SMTP_USER,
      to: userProfile.email,
      subject: 'Verify Your Email',
      html: emailHtml
    });

    // Never send password hash in response
    delete userProfile.password_hash;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: userProfile
    });
  } catch (error) {
    console.log(
      '*************** Error while creating user ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Verify user account
 */
module.exports.verifyUserAccount = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    let tokenSearchQuery = {
      where: {
        token: token
      }
    };

    const verificationTokenRow = await EmailVerificationTokenManager.getEmailVerificationToken(tokenSearchQuery);

    if (!verificationTokenRow) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const userProfile = await UserManager.getUserById(verificationTokenRow.user_id);

    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    if (userProfile.is_email_verified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

    if (
      !verificationTokenRow.expires_at ||
      new Date(verificationTokenRow.expires_at) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    let updateQuery = {
      is_email_verified: true
    };

    let userSearchQuery = {
      where: {
        id: userProfile.id
      }
    };

    await UserManager.updateUserProfile(
      updateQuery,
      userSearchQuery
    );

    // Token has been consumed, remove it so it cannot be reused
    await EmailVerificationTokenManager.deleteEmailVerificationToken(tokenSearchQuery);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while verifying user account ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Resend verification email
 */
module.exports.resendVerificationEmail = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const email = params.email.toLowerCase().trim();

    let searchQuery = {
      where: {
        email: email
      }
    };

    const userProfile = await UserManager.getUserProfile(searchQuery    );

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userProfile.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Token will expire after 24 hours
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Replace the user's existing token (if any) so only the latest link is valid
    await EmailVerificationTokenManager.upsertEmailVerificationToken({
      user_id: userProfile.id,
      token: verificationToken,
      expires_at: verificationExpiresAt
    });

    // Create verification link
    const verificationLink =`${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Generate email HTML
    const emailHtml = verifyEmailTemplate({
      firstName: userProfile.first_name,
      verificationLink: verificationLink
    });

    // Send verification email
    await EmailService.sendEmail({
      from: process.env.SMTP_USER,
      to: userProfile.email,
      subject: 'Verify Your Email',
      html: emailHtml
    });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while resending verification email ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Login user
 */
module.exports.login = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.email || !params.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const email = params.email.toLowerCase().trim();

    // Find user by email
    const userProfile = await UserManager.getUserProfile({
      where: {
        email
      }
    });

    if (!userProfile) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check user status
    if (userProfile.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Compare password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(
      params.password,
      userProfile.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const accessToken = AuthService.generateAccessToken({
      id: userProfile.id,
      role: userProfile.role
    });

    // Don't return password hash
    delete userProfile.password_hash;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        user: userProfile
      }
    });
  } catch (error) {
    console.log(
      '*************** Error while user login ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Fetch logged-in user details
 */
module.exports.fetchUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    let searchQuery = {
      where: {
        id: userId,
        status: 'ACTIVE'
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_image', 'role', 'is_email_verified', 'status', 'created_at', 'updated_at' ]
    };

    let userData = await UserManager.getUserProfile(searchQuery);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: userData
    });

  } catch (error) {
    console.log(
      '*************** Error while fetching user details ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Update logged-in user profile
 */
module.exports.updateUserProfile = async (req, res) => {
  try {
    const params = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!params || Object.keys(params).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    let updateQuery = {};

    if (params.first_name !== undefined) {
      updateQuery.first_name = params.first_name.trim();
    }

    if (params.last_name !== undefined) {
      updateQuery.last_name = params.last_name
        ? params.last_name.trim()
        : null;
    }

    if (params.phone !== undefined) {
      updateQuery.phone = params.phone;
    }

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    let searchQuery = {
      where: {
        id: userId,
        status: 'ACTIVE'
      }
    };

    await UserManager.updateUserProfile(
      updateQuery,
      searchQuery
    );

    searchQuery = {
        where: {
        id: userId,
        status: 'ACTIVE'
        },
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_image', 'role', 'is_email_verified', 'status', 'created_at', 'updated_at']
    };

    let userData = await UserManager.getUserProfile(searchQuery);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: userData
    });
  } catch (error) {
    console.log(
      '*************** Error while updating user profile ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Get user list
 */
module.exports.getUserList = async (req, res) => {
  try {
    const params = req.query;

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    let searchQuery = {
      where: {
        status: 'ACTIVE'
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_image', 'role', 'is_email_verified', 'status', 'created_at', 'updated_at'],
      order: [
        ['created_at', 'DESC']
      ],
      limit: limit,
      offset: offset
    };

    if (params.search) {
      const search = params.search.trim();
      searchQuery.where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    let userList = await UserManager.getUserListAndCount(searchQuery);

    return res.status(200).json({
      success: true,
      message: 'User list fetched successfully',
      data: {
        users: userList.rows,
        total: userList.count,
        page: page,
        limit: limit
      }
    });
  } catch (error) {
    console.log(
      '*************** Error while fetching user list ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Admin create user
 */
module.exports.adminCreateUser = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.first_name || !params.email || !params.password) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and password are required'
      });
    }

    const email = params.email.toLowerCase().trim();

    let searchQuery = {
      where: {
        email: email
      }
    };

    const existingUser = await UserManager.getUserProfile(searchQuery);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already registered'
      });
    }

    const passwordHash = await bcrypt.hash(params.password,10);

    const payload = {
      first_name: params.first_name.trim(),
      last_name: params.last_name
        ? params.last_name.trim()
        : null,
      email: email,
      password_hash: passwordHash,
      phone: params.phone || null,
      profile_image: null,
      role: params.role || 'USER',
      is_email_verified: false,
      status: 'ACTIVE'
    };

    const userProfile = await UserManager.createUserProfile(payload);

    delete userProfile.password_hash;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userProfile
    });
  } catch (error) {
    console.log(
      '*************** Error while admin creating user ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Update user status by admin
 */
module.exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const params = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User id is required'
      });
    }

    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    if (!params || !params.status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!['ACTIVE', 'INACTIVE'].includes(params.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let searchQuery = {
      where: {
        id: userId
      }
    };

    const userProfile = await UserManager.getUserProfile(searchQuery);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let updateQuery = {status: params.status};

    await UserManager.updateUserProfile(updateQuery, searchQuery);

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while updating user status ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Update user role by admin
 */
module.exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const params = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User id is required'
      });
    }

    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    if (!params || !params.role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    if (!['USER', 'ADMIN'].includes(params.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    let searchQuery = {
      where: {
        id: userId
      }
    };

    const userProfile = await UserManager.getUserProfile(searchQuery);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let updateQuery = {
      role: params.role
    };

    await UserManager.updateUserProfile(
      updateQuery,
      searchQuery
    );

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while updating user role ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


module.exports.forgotPassword = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const email = params.email.toLowerCase().trim();

    let searchQuery = {
      where: {
        email: email
      }
    };

    const userProfile = await UserManager.getUserProfile(searchQuery);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove any previous, unused reset tokens for this user so only the
    // latest link is valid
    await PasswordResetTokenManager.deletePasswordResetToken({
      where: {
        user_id: userProfile.id
      }
    });

    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await PasswordResetTokenManager.createPasswordResetToken({
      user_id: userProfile.id,
      token: resetToken,
      expires_at: resetExpiresAt
    });

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailHtml = resetPasswordTemplate({
      firstName: userProfile.first_name,
      resetLink: resetLink
    });

    await EmailService.sendEmail({
      from: process.env.SMTP_USER,
      to: userProfile.email,
      subject: 'Reset Your Password',
      html: emailHtml
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while forgot password ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


module.exports.resetPassword = async (req, res) => {
  try {
    const params = req.body;

    if (!params || !params.token || !params.new_password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    let tokenSearchQuery = {
      where: {
        token: params.token
      }
    };

    const resetTokenRow = await PasswordResetTokenManager.getPasswordResetToken(tokenSearchQuery);

    if (!resetTokenRow) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (
      !resetTokenRow.expires_at ||
      new Date(resetTokenRow.expires_at) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired'
      });
    }

    const passwordHash = await bcrypt.hash(
      params.new_password,
      10
    );

    let updateQuery = {
      password_hash: passwordHash
    };

    let userSearchQuery = {
      where: {
        id: resetTokenRow.user_id
      }
    };

    await UserManager.updateUserProfile(
      updateQuery,
      userSearchQuery
    );

    // Token has been consumed, remove it so it cannot be reused
    await PasswordResetTokenManager.deletePasswordResetToken(tokenSearchQuery);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.log(
      '*************** Error while resetting password ***************',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


/**
 * Update logged-in user profile image
 */
module.exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
    }

    const uploadResult = await CloudinaryService.uploadProfileImage(req.file.buffer, userId);

    await UserManager.updateUserProfile(
      {
        profile_image: uploadResult.secure_url,
        profile_image_public_id: uploadResult.public_id
      },
      { where: { id: userId, status: 'ACTIVE' } }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profile_image: uploadResult.secure_url }
    });
  } catch (error) {
    console.log('*************** Error while updating profile image ***************', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};



module.exports.logout = async (req, res) => {
  try {
    // Client should remove the JWT after receiving this response

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error while logging out:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};