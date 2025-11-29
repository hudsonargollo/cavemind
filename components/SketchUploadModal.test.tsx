import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import SketchUploadModal from './SketchUploadModal';

describe('SketchUploadModal', () => {
  const mockOnClose = vi.fn();
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Unit Tests', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <SketchUploadModal
          isOpen={false}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          isProcessing={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <SketchUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          isProcessing={false}
        />
      );
      expect(screen.getByText('SKETCH TO DIAGRAM')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <SketchUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          isProcessing={false}
        />
      );
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should disable close button when processing', () => {
      render(
        <SketchUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          isProcessing={true}
        />
      );
      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeDisabled();
    });

    it('should show processing indicator when isProcessing is true', () => {
      render(
        <SketchUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          isProcessing={true}
        />
      );
      expect(screen.getByText('Processing your sketch...')).toBeInTheDocument();
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: adaptive-dockable-toolbar, Property 10: Image format validation
     * Validates: Requirements 9.1
     * 
     * For any file upload, the system should accept PNG, JPEG, and WEBP formats
     * and reject all other formats
     */
    it('Property 10: Image format validation - accepts valid formats and rejects invalid ones', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('image/png'),
            fc.constant('image/jpeg'),
            fc.constant('image/webp'),
            fc.constant('image/gif'),
            fc.constant('image/svg+xml'),
            fc.constant('application/pdf'),
            fc.constant('text/plain'),
            fc.constant('video/mp4')
          ),
          fc.integer({ min: 1, max: 10 * 1024 * 1024 }), // File size up to 10MB
          (mimeType, fileSize) => {
            // Create a mock file with the given mime type
            const file = new File(['test content'], 'test-file', { type: mimeType });
            Object.defineProperty(file, 'size', { value: fileSize });

            const { container, unmount } = render(
              <SketchUploadModal
                isOpen={true}
                onClose={mockOnClose}
                onUpload={mockOnUpload}
                isProcessing={false}
              />
            );

            // Get the file input
            const fileInput = container.querySelector('#sketch-file-input') as HTMLInputElement;
            expect(fileInput).toBeTruthy();

            // Simulate file selection
            Object.defineProperty(fileInput, 'files', {
              value: [file],
              writable: false,
            });
            fireEvent.change(fileInput);

            // Valid formats: PNG, JPEG, WEBP
            const validFormats = ['image/png', 'image/jpeg', 'image/webp'];
            const isValid = validFormats.includes(mimeType);

            if (isValid) {
              // Should not show error for valid formats
              const errorMessages = screen.queryAllByText(/Invalid file format/i);
              expect(errorMessages.length).toBe(0);
            } else {
              // Should show error for invalid formats
              const errorElement = screen.queryByText(/Invalid file format/i);
              expect(errorElement).not.toBeNull();
            }

            // Cleanup
            unmount();
            vi.clearAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: File size validation
     * 
     * For any file upload, the system should reject files larger than 10MB
     */
    it('Property: File size validation - rejects files larger than 10MB', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 * 1024 * 1024 }), // File size up to 20MB
          (fileSize) => {
            const file = new File(['test content'], 'test.png', { type: 'image/png' });
            Object.defineProperty(file, 'size', { value: fileSize });

            const { container, unmount } = render(
              <SketchUploadModal
                isOpen={true}
                onClose={mockOnClose}
                onUpload={mockOnUpload}
                isProcessing={false}
              />
            );

            const fileInput = container.querySelector('#sketch-file-input') as HTMLInputElement;
            if (fileInput) {
              Object.defineProperty(fileInput, 'files', {
                value: [file],
                writable: false,
              });
              fireEvent.change(fileInput);

              const maxSize = 10 * 1024 * 1024; // 10MB
              const isValid = fileSize <= maxSize;

              if (isValid) {
                // Should not show size error for valid sizes
                const errorMessages = screen.queryAllByText(/exceeds 10MB/i);
                expect(errorMessages.length).toBe(0);
              } else {
                // Should show error for files too large
                const errorElement = screen.queryByText(/exceeds 10MB/i);
                expect(errorElement).not.toBeNull();
              }
            }

            unmount();
            vi.clearAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Upload button state
     * 
     * For any modal state, the upload button should be disabled when no file is selected
     * or when processing is in progress
     */
    it('Property: Upload button is disabled without file or during processing', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isProcessing
          fc.boolean(), // hasFile
          (isProcessing, hasFile) => {
            const { container, unmount } = render(
              <SketchUploadModal
                isOpen={true}
                onClose={mockOnClose}
                onUpload={mockOnUpload}
                isProcessing={isProcessing}
              />
            );

            if (hasFile) {
              // Simulate file selection
              const file = new File(['test'], 'test.png', { type: 'image/png' });
              const fileInput = container.querySelector('#sketch-file-input') as HTMLInputElement;
              if (fileInput) {
                Object.defineProperty(fileInput, 'files', {
                  value: [file],
                  writable: false,
                });
                fireEvent.change(fileInput);
              }
            }

            const buttonText = isProcessing ? 'Processing...' : 'Generate Diagram';
            const uploadButtons = screen.queryAllByText(buttonText);
            
            // Should have exactly one button
            expect(uploadButtons.length).toBe(1);
            const uploadButton = uploadButtons[0];
            
            // Button should be disabled if no file OR if processing
            const shouldBeDisabled = !hasFile || isProcessing;
            
            if (shouldBeDisabled) {
              expect(uploadButton).toBeDisabled();
            } else {
              expect(uploadButton).not.toBeDisabled();
            }

            unmount();
            vi.clearAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
