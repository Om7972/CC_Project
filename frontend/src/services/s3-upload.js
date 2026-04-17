import axios from 'axios';

const S3_UPLOAD_TIMEOUT = 30000; // 30 seconds

/**
 * Upload file to S3 using presigned URL
 */
export const uploadToS3 = async (presignedUrl, file) => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      timeout: S3_UPLOAD_TIMEOUT,
    });

    // Extract file URL from presigned URL (remove query parameters)
    const fileUrl = presignedUrl.split('?')[0];
    return fileUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Generate S3 file key from presigned URL response
 */
export const extractFileKeyFromPresignedUrl = (presignedUrl) => {
  const url = new URL(presignedUrl);
  return url.pathname.substring(1); // Remove leading /
};
