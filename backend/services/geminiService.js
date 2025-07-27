const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  }

  async compareFiles({ image, pdf }) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Please analyze and compare the content of this image and PDF document. Provide a detailed comparison in the following categories:

1. Content Type - What type of content does each file contain?
2. Text Content - What textual information is present in each file?
3. Visual Elements - Describe the visual components in each file
4. Data/Information Present - What specific data or information can be found?
5. Quality/Resolution - Assess the quality and clarity of each file
6. File Size - Comment on the file sizes and their implications
7. Accessibility - How accessible is the content in each format?
8. Use Cases - What are the typical use cases for each file type?
9. Key Differences - What are the main differences between the files?
10. Similarities - What similarities exist between the contents?

Please provide specific, detailed analysis for each category.`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: image.mimeType,
              data: image.base64
            }
          },
          {
            inline_data: {
              mime_type: pdf.mimeType,
              data: pdf.base64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request to Gemini API - check file formats');
      } else if (error.response?.status === 403) {
        throw new Error('Gemini API key is invalid or has no quota');
      } else if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded');
      } else {
        throw new Error(`Gemini API error: ${error.message}`);
      }
    }
  }
}

module.exports = new GeminiService();