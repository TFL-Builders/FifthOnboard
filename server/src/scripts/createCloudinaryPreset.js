import cloudinary from "../config/cloudinary.js";
import dotenv from 'dotenv'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

async function createUploadPreset() {
    try {
        console.log(process.env.CLOUDINARY_UPLOAD_PRESET);
        const result = await cloudinary.api.create_upload_preset({
            name: process.env.CLOUDINARY_UPLOAD_PRESET,
            signing_secret: true,          
            folder: 'onboardings',
            allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'docx'],
            max_file_size: 10485760,      
            unique_filename: true,          
            overwrite: false,         
            resource_type: 'auto',     
        });

        console.log('Upload preset created:', result);
    } catch (error) {
        if (error.error?.message?.includes('already exists')) {
            console.log('Preset already exists — updating...');
            const result = await cloudinary.api.update_upload_preset(process.env.CLOUDINARY_UPLOAD_PRESET, {
                signing_secret: true,
                folder: 'onboardings',
                allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'docx'],
                max_file_size: 10485760,
                unique_filename: true,
                overwrite: false,
                resource_type: 'auto',
            });
            console.log('Upload preset updated:', result);
        } else {
            console.error('Failed:', error.message);
        }
    }
}

createUploadPreset();