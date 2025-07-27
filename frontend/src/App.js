import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image, Loader2, AlertCircle, ArrowLeftRight, CheckCircle, Table, FileImage } from 'lucide-react';
import FormComparisonTable from './FormComparisonTable'; // Import the new component
import './App.css';

const App = () => {
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeView, setActiveView] = useState('comparison'); // New state for view switching

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  // Handle PDF upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  // Compare files using backend API
  const compareFiles = async () => {
    if (!imageFile || !pdfFile) {
      setError('Please upload both image and PDF files');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('pdf', pdfFile);

    try {
      const response = await axios.post('/api/compare', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResults(response.data.comparison);
        setSuccess('Files compared successfully!');
      } else {
        setError(response.data.error || 'Comparison failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFiles = () => {
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            File Analysis & Comparison Tools
          </h1>
          <p className="text-gray-600 mb-6">
            {activeView === 'comparison' 
              ? 'Upload files and compare them using Gemini 2.5 AI' 
              : 'Compare form data fields side by side'
            }
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveView('comparison')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'comparison'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <FileImage className="w-5 h-5 mr-2" />
              Image & PDF Comparison
            </button>
            <button
              onClick={() => setActiveView('formComparison')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'formComparison'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Table className="w-5 h-5 mr-2" />
              Form Data Comparison
            </button>
          </div>
        </div>

        {/* Conditional Content Based on Active View */}
        {activeView === 'comparison' ? (
          <>
            {/* Upload Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-blue-500" />
                  Upload Image
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload image</p>
                    <p className="text-sm text-gray-400">PNG, JPG, JPEG up to 10MB</p>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">{imageFile?.name}</p>
                  </div>
                )}
              </div>

              {/* PDF Upload */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-500" />
                  Upload PDF
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload PDF</p>
                    <p className="text-sm text-gray-400">PDF files up to 10MB</p>
                  </label>
                </div>
                {pdfFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium">{pdfFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mb-8 space-x-4">
              <button
                onClick={compareFiles}
                disabled={!imageFile || !pdfFile || loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Comparing...' : 'Compare Files'}
              </button>
              
              <button
                onClick={resetFiles}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Reset
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Results Table */}
            {results && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold text-gray-800">Comparison Results</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image Analysis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PDF Analysis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comparison
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs overflow-hidden">
                              {result.imageAnalysis}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs overflow-hidden">
                              {result.pdfAnalysis}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs overflow-hidden">
                              {result.comparison}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Form Comparison Table View */
          <FormComparisonTable />
        )}
      </div>
    </div>
  );
};

export default App;