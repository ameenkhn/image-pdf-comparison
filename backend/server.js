const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const geminiService = require('./services/geminiService');
const fileProcessor = require('./services/fileProcessor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image field'));
      }
    } else if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for PDF field'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Image PDF Comparison API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/compare - Compare image and PDF files',
      'GET /api/health - Health check'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main comparison endpoint
app.post('/api/compare', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.image || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        error: 'Both image and PDF files are required'
      });
    }

    const imageFile = req.files.image[0];
    const pdfFile = req.files.pdf[0];

    console.log('Processing files:', {
      image: imageFile.originalname,
      pdf: pdfFile.originalname
    });

    // Process files and get comparison
    const comparison = await processComparison(imageFile, pdfFile);

    // Clean up uploaded files
    cleanupFiles([imageFile.path, pdfFile.path]);

    res.json({
      success: true,
      comparison: comparison,
      message: 'Files compared successfully'
    });

  } catch (error) {
    console.error('Comparison error:', error);
    
    // Clean up files in case of error
    if (req.files) {
      const filePaths = [];
      if (req.files.image) filePaths.push(req.files.image[0].path);
      if (req.files.pdf) filePaths.push(req.files.pdf[0].path);
      cleanupFiles(filePaths);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during comparison'
    });
  }
});

// Process comparison function
async function processComparison(imageFile, pdfFile) {
  try {
    // Convert files to base64
    const imageBase64 = await fileProcessor.fileToBase64(imageFile.path);
    const pdfBase64 = await fileProcessor.fileToBase64(pdfFile.path);

    // Get file metadata
    const imageMetadata = await fileProcessor.getImageMetadata(imageFile);
    const pdfMetadata = await fileProcessor.getPdfMetadata(pdfFile);

    // Call Gemini API for comparison
    const geminiAnalysis = await geminiService.compareFiles({
      image: {
        base64: imageBase64,
        mimeType: imageFile.mimetype,
        metadata: imageMetadata
      },
      pdf: {
        base64: pdfBase64,
        mimeType: pdfFile.mimetype,
        metadata: pdfMetadata
      }
    });

    // Parse and structure the comparison results
    const structuredResults = parseGeminiResponse(geminiAnalysis, imageMetadata, pdfMetadata);

    return structuredResults;

  } catch (error) {
    console.error('Processing error:', error);
    throw new Error(`Processing failed: ${error.message}`);
  }
}

// Parse Gemini response into structured format
function parseGeminiResponse(analysisText, imageMetadata, pdfMetadata) {
  const categories = [
    'Content Type', 'Text Content', 'Visual Elements', 'Data/Information Present',
    'Quality/Resolution', 'File Size', 'Accessibility', 'Use Cases',
    'Key Differences', 'Similarities'
  ];

  // Start with file metadata
  const results = [
    {
      category: 'File Name',
      imageAnalysis: imageMetadata.originalName,
      pdfAnalysis: pdfMetadata.originalName,
      comparison: 'Different file names and types'
    },
    {
      category: 'File Size',
      imageAnalysis: `${imageMetadata.sizeFormatted}`,
      pdfAnalysis: `${pdfMetadata.sizeFormatted}`,
      comparison: imageMetadata.size > pdfMetadata.size ? 'Image is larger' : 'PDF is larger'
    },
    {
      category: 'File Type',
      imageAnalysis: imageMetadata.mimeType,
      pdfAnalysis: pdfMetadata.mimeType,
      comparison: 'Different file formats (Image vs PDF)'
    }
  ];

  // Parse Gemini analysis for each category
  categories.forEach(category => {
    const regex = new RegExp(`\\d+\\.\\s*${category}[:\\s]*([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
    const match = analysisText.match(regex);
    
    let content = match ? match[1].trim() : 'Analysis not available';
    content = content.replace(/^\d+\..*?\n/, '').trim();
    
    // Limit content length for table display
    if (content.length > 150) {
      content = content.substring(0, 150) + '...';
    }

    results.push({
      category,
      imageAnalysis: extractImageContent(content) || 'Processing...',
      pdfAnalysis: extractPdfContent(content) || 'Processing...',
      comparison: content
    });
  });

  return results;
}

// Helper functions to extract specific content
function extractImageContent(text) {
  const imageKeywords = ['image', 'visual', 'picture', 'photo', 'graphic'];
  if (imageKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return text;
  }
  return 'Visual content analysis';
}

function extractPdfContent(text) {
  const pdfKeywords = ['pdf', 'document', 'text', 'page'];
  if (pdfKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return text;
  }
  return 'Document content analysis';
}

// Clean up uploaded files
function cleanupFiles(filePaths) {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Cleaned up:', filePath);
    }
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    console.warn('   Please add GEMINI_API_KEY to your .env file');
  }
});