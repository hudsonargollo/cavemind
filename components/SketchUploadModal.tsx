import React, { useState, useCallback, DragEvent } from 'react';

interface SketchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const VALID_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const SketchUploadModal: React.FC<SketchUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isProcessing,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Validate file format
    if (!VALID_FORMATS.includes(file.type)) {
      return 'Invalid file format. Please upload a PNG, JPEG, or WEBP image.';
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      // Reset state on successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setIsDragging(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <h2 className="text-xl font-jersey text-[#E5E5E5] tracking-wider">
            SKETCH TO DIAGRAM
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!previewUrl ? (
            /* File Upload Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all
                ${isDragging 
                  ? 'border-[#FF3333] bg-[#FF3333]/10' 
                  : 'border-[#333] hover:border-[#555]'
                }
              `}
            >
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg text-[#E5E5E5] mb-2">
                Drop your sketch here
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                id="sketch-file-input"
                disabled={isProcessing}
              />
              <label
                htmlFor="sketch-file-input"
                className="inline-block px-6 py-2 bg-[#333] hover:bg-[#444] text-[#E5E5E5] rounded-lg cursor-pointer transition-colors"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-600 mt-4">
                Supported formats: PNG, JPEG, WEBP • Max size: 10MB
              </p>
            </div>
          ) : (
            /* Image Preview */
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-[#333] bg-[#0A0A0A]">
                <img
                  src={previewUrl}
                  alt="Sketch preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  <span className="text-[#E5E5E5]">{selectedFile?.name}</span>
                  <span className="ml-2">
                    ({(selectedFile!.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError(null);
                  }}
                  disabled={isProcessing}
                  className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-4 p-4 bg-[#FF3333]/10 border border-[#FF3333]/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#FF3333] border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm text-[#E5E5E5] font-medium">
                    Processing your sketch...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    AI is analyzing the image and generating diagram elements
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#333] bg-[#0A0A0A]/50">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
            className="px-6 py-2 bg-[#FF3333] hover:bg-[#D92B2B] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Generate Diagram'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SketchUploadModal;
