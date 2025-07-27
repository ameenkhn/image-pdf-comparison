const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');

class FileProcessor {
  async fileToBase64(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to convert file to base64: ${error.message}`);
    }
  }

  async getImageMetadata(imageFile) {
    try {
      const metadata = await sharp(imageFile.path).metadata();
      
      return {
        originalName: imageFile.originalname,
        mimeType: imageFile.mimetype,
        size: imageFile.size,
        sizeFormatted: this.formatFileSize(imageFile.size),
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return {
        originalName: imageFile.originalname,
        mimeType: imageFile.mimetype,
        size: imageFile.size,
        sizeFormatted: this.formatFileSize(imageFile.size),
        error: 'Could not read image metadata'
      };
    }
  }

  async getPdfMetadata(pdfFile) {
    try {
      const dataBuffer = fs.readFileSync(pdfFile.path);
      const pdfData = await pdfParse(dataBuffer);
      
      return {
        originalName: pdfFile.originalname,
        mimeType: pdfFile.mimetype,
        size: pdfFile.size,
        sizeFormatted: this.formatFileSize(pdfFile.size),
        pages: pdfData.numpages,
        textContent: pdfData.text.substring(0, 500) + '...', // First 500 chars
        info: pdfData.info,
        metadata: pdfData.metadata
      };
    } catch (error) {
      console.error('Error getting PDF metadata:', error);
      return {
        originalName: pdfFile.originalname,
        mimeType: pdfFile.mimetype,
        size: pdfFile.size,
        sizeFormatted: this.formatFileSize(pdfFile.size),
        error: 'Could not read PDF metadata'
      };
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new FileProcessor();