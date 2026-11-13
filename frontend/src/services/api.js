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
  validateClientFile(file);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/process-document', {
      method: 'POST',
      body: formData,
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
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Could not reach the document extraction server. Please ensure the backend is running.'
      );
    }
    throw err;
  }
};

export const analyzeMedicalText = async (text, filename = 'document') => {
  if (!text || !text.trim()) {
    throw new Error('No extracted text available to analyze.');
  }

  try {
    const response = await fetch('/api/analyze-medical-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || `Gemini analysis failed with HTTP status ${response.status}.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.missingKey = Boolean(data?.missing_key);
      throw error;
    }

    return data.structured_data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Could not reach the backend server to run Gemini extraction. Please verify the Flask server is running.'
      );
    }
    throw err;
  }
};

// Module 4: Explain Medical Report in Plain English
export const explainMedicalReport = async (text, structuredData = null) => {
  if (!text || !text.trim()) {
    throw new Error('No extracted text available to explain.');
  }

  try {
    const response = await fetch('/api/explain-medical-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        structured_data: structuredData,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || `Explanation failed with HTTP status ${response.status}.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.missingKey = Boolean(data?.missing_key);
      throw error;
    }

    return data.explanations;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Could not reach backend server for medical explanations.');
    }
    throw err;
  }
};

// Module 5: Ask Your Report Q&A
export const askDocumentQuestion = async (question, text, structuredData = null) => {
  if (!question || !question.trim()) {
    throw new Error('Please enter a question.');
  }
  if (!text || !text.trim()) {
    throw new Error('No report text available to answer from.');
  }

  try {
    const response = await fetch('/api/ask-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.trim(),
        text,
        structured_data: structuredData,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || `Q&A failed with HTTP status ${response.status}.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.missingKey = Boolean(data?.missing_key);
      throw error;
    }

    return data.response;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Could not reach backend server to answer question.');
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
