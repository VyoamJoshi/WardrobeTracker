import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Image Storage Service
 * Supports local file uploads for development and clean extension for Cloudinary in production
 */
class ImageStorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';
    this.isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Process and store an uploaded image file
   * @param {Object} file - Express multer file object
   * @returns {Promise<string>} Public image URL
   */
  async processUpload(file) {
    if (!file) {
      return null;
    }

    if (this.provider === 'cloudinary' && this.isCloudinaryConfigured) {
      return this.uploadToCloudinary(file);
    }

    // Default Local Storage
    return `/uploads/${file.filename}`;
  }

  /**
   * Delete an image
   * @param {string} imageUrl 
   */
  async deleteImage(imageUrl) {
    if (!imageUrl) return;

    if (imageUrl.startsWith('/uploads/')) {
      const filename = imageUrl.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`[Storage] Failed to delete local file ${filename}:`, err.message);
        }
      }
    } else if (this.provider === 'cloudinary' && this.isCloudinaryConfigured) {
      // Cloudinary deletion hook
      console.log(`[Storage] Cloudinary delete hook called for ${imageUrl}`);
    }
  }

  /**
   * Upload to Cloudinary (structure ready for production)
   */
  async uploadToCloudinary(file) {
    try {
      // Dynamic import of cloudinary if needed in production
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'wardrobe-tracker',
      });

      // Cleanup local temp file if any
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return result.secure_url;
    } catch (err) {
      console.error('[Storage] Cloudinary upload error:', err);
      // Fallback to local
      return `/uploads/${file.filename}`;
    }
  }
}

export const imageStorageService = new ImageStorageService();
export default imageStorageService;
