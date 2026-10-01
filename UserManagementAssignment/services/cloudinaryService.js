const cloudinary = require('../config/cloudinary');

const PROFILE_FOLDER = 'user-management/profile-images';

/**
 * Upload image buffer to Cloudinary
 */
module.exports.uploadProfileImage = (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(  
      {
        folder: PROFILE_FOLDER,
        public_id: `user_${userId}`,   // same user = same file, overwrite hoga
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 */
module.exports.deleteProfileImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};