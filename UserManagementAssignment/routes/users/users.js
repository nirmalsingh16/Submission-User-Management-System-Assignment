const express = require('express');
const router = express.Router();
const UserCtrl = require('../../controllers/users/userController');
const AuthService = require('../../services/authentication/authService');
const UploadMiddleware = require('../../services/uploadMiddleware');

/**
 * API routes for user operation
 */
router.post('/register',            UserCtrl.createUserProfile);
router.post('/login',               UserCtrl.login);
router.get('/profile',              AuthService.validateAccessToken, UserCtrl.fetchUserDetails);
router.put('/profile/update',       AuthService.validateAccessToken, UserCtrl.updateUserProfile);
router.get( '/verify/account',      UserCtrl.verifyUserAccount);
router.post('/resend-verification', UserCtrl.resendVerificationEmail);
router.post('/forgot-password',     UserCtrl.forgotPassword);
router.post('/reset-password',      UserCtrl.resetPassword);
router.put('/profile/image',        AuthService.validateAccessToken, UploadMiddleware.uploadProfileImage, UserCtrl.updateProfileImage);
router.post('/logout',              AuthService.validateAccessToken, UserCtrl.logout);

/**
 * API routes for Admin operation
 */
router.get('/list',                 AuthService.validateAccessToken, AuthService.validateAdminAccess, UserCtrl.getUserList);
router.post('/admin/create-user',   AuthService.validateAccessToken, AuthService.validateAdminAccess, UserCtrl.adminCreateUser);
router.put('/admin/user/status/:id',AuthService.validateAccessToken, AuthService.validateAdminAccess, UserCtrl.updateUserStatus);
router.put('/admin/user/role/:id',  AuthService.validateAccessToken, AuthService.validateAdminAccess, UserCtrl.updateUserRole);


module.exports = router;