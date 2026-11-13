// MediClarity Document API Client Service

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB strict limit
const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

export const validateClientFile = (file) => {
  if (!file) {
    throw new Error('No document was selected.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type ".${ext || 'unknown'}". Please upload a PDF, PNG, JPG, or JPEG file.`
    );
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty (0 bytes).');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size exceeds the 10 MB limit (${sizeMb} MB). Please upload a smaller document.`
    );
  }

  return true;
};

export const uploadAndProcessDocument = async (file) => {
  // Pre-validate in browser
  validateClientFile(file);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/process-document', {
      method: 'POST',
      body: formData,
      // Browser automatically sets multipart/form-data boundary
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || `Upload failed with HTTP status ${response.status}.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    // Pass through explicit API errors or format network failures
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Could not reach the document extraction server. Please ensure the backend is running.'
      );
    }
    throw err;
  }
};

export const fetchHealthCheck = async () => {
  try {
    const response = await fetch('/api/health');
    return await response.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
};
