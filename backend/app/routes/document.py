import os
from flask import Blueprint, request, jsonify
from ..config import Config
from ..services.cleaner import EphemeralDirectory, save_ephemeral_file
from ..services.validator import (
    ValidationError,
    validate_file_header_magic_bytes,
    validate_document_structure,
    get_file_extension
)
from ..services.extractor import extract_document_text
from ..services.gemini_service import (
    GeminiError,
    extract_structured_medical_data,
    generate_medical_explanations,
    answer_document_question
)

document_bp = Blueprint('document', __name__)

@document_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'MediClarity AI Comprehensive Medical Report Engine',
        'version': '5.0.0',
        'gemini_configured': bool(Config.GEMINI_API_KEY),
        'gemini_model': Config.GEMINI_MODEL,
        'limits': {
            'max_file_size_mb': Config.MAX_CONTENT_LENGTH // (1024 * 1024),
            'max_pdf_pages': Config.MAX_PDF_PAGES,
            'supported_formats': list(Config.ALLOWED_EXTENSIONS)
        }
    }), 200


@document_bp.route('/process-document', methods=['POST'])
def process_document():
    # 1. Check if multipart file exists in request
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'error': 'No document file was provided in the upload request.'
        }), 400

    file_item = request.files['file']
    if not file_item or not file_item.filename:
        return jsonify({
            'status': 'error',
            'error': 'No file selected for upload.'
        }), 400

    # Quick extension pre-check
    ext = get_file_extension(file_item.filename)
    if ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({
            'status': 'error',
            'error': f"Unsupported file extension '.{ext}'. Allowed types are PDF, PNG, JPG, and JPEG."
        }), 415

    # 2. Ephemeral execution context: guarantees temporary files are deleted
    try:
        with EphemeralDirectory() as temp_dir:
            # Save file safely to ephemeral directory
            saved_path, safe_name = save_ephemeral_file(file_item, temp_dir)

            # 3. Deep Content Validation (Magic bytes + size)
            detected_type = validate_file_header_magic_bytes(saved_path)

            # 4. Structural Validation (PDF page limit, encryption, image header)
            validate_document_structure(saved_path, detected_type)

            # 5. Selective Hybrid Text Extraction
            extraction_result = extract_document_text(saved_path, detected_type)

            # Return success response
            return jsonify({
                'status': 'success',
                'filename': safe_name,
                'file_type': detected_type,
                'extraction_method': extraction_result['extraction_method'],
                'page_count': extraction_result['page_count'],
                'word_count': extraction_result['word_count'],
                'char_count': extraction_result['char_count'],
                'extracted_text': extraction_result['extracted_text'],
                'pages': extraction_result['pages'],
                'gemini_configured': bool(Config.GEMINI_API_KEY)
            }), 200

    except ValidationError as val_err:
        return jsonify({
            'status': 'error',
            'error': val_err.message
        }), val_err.status_code

    except Exception as exc:
        return jsonify({
            'status': 'error',
            'error': f"An unexpected error occurred while processing the document: {str(exc)}"
        }), 500


@document_bp.route('/analyze-medical-text', methods=['POST'])
def analyze_medical_text():
    """
    Module 3: Extracts structured clinical data (tests, observed values, units, ranges, flags).
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()
    filename = data.get('filename', 'document')

    if not text:
        return jsonify({
            'status': 'error',
            'error': 'No medical document text provided for analysis.'
        }), 400

    if not Config.GEMINI_API_KEY:
        return jsonify({
            'status': 'error',
            'error': 'Gemini API key is not configured in backend environment variables (GEMINI_API_KEY).',
            'missing_key': True
        }), 503

    try:
        structured_data = extract_structured_medical_data(text)
        return jsonify({
            'status': 'success',
            'filename': filename,
            'structured_data': structured_data
        }), 200

    except GeminiError as g_err:
        return jsonify({
            'status': 'error',
            'error': g_err.message
        }), g_err.status_code

    except Exception as exc:
        return jsonify({
            'status': 'error',
            'error': f"Failed to extract structured medical information: {str(exc)}"
        }), 500


@document_bp.route('/explain-medical-report', methods=['POST'])
def explain_medical_report():
    """
    Module 4: Generates plain-English medical explanations comparing test values
    against report reference ranges and explaining terms simply.
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()
    structured_data = data.get('structured_data')

    if not text:
        return jsonify({
            'status': 'error',
            'error': 'No medical document text provided for explanation.'
        }), 400

    if not Config.GEMINI_API_KEY:
        return jsonify({
            'status': 'error',
            'error': 'Gemini API key is not configured in backend environment variables (GEMINI_API_KEY).',
            'missing_key': True
        }), 503

    try:
        explanations = generate_medical_explanations(text, structured_data)
        return jsonify({
            'status': 'success',
            'explanations': explanations
        }), 200

    except GeminiError as g_err:
        return jsonify({
            'status': 'error',
            'error': g_err.message
        }), g_err.status_code

    except Exception as exc:
        return jsonify({
            'status': 'error',
            'error': f"Failed to generate medical explanations: {str(exc)}"
        }), 500


@document_bp.route('/ask-document', methods=['POST'])
def ask_document():
    """
    Module 5: Answers patient questions strictly grounded in the extracted document text.
    """
    data = request.get_json(silent=True) or {}
    question = data.get('question', '').strip()
    text = data.get('text', '').strip()
    structured_data = data.get('structured_data')

    if not question:
        return jsonify({
            'status': 'error',
            'error': 'Please enter a question to ask your report.'
        }), 400

    if not text:
        return jsonify({
            'status': 'error',
            'error': 'No document text found. Please upload a report before asking questions.'
        }), 400

    if not Config.GEMINI_API_KEY:
        return jsonify({
            'status': 'error',
            'error': 'Gemini API key is not configured in backend environment variables (GEMINI_API_KEY).',
            'missing_key': True
        }), 503

    try:
        answer_data = answer_document_question(question, text, structured_data)
        return jsonify({
            'status': 'success',
            'response': answer_data
        }), 200

    except GeminiError as g_err:
        return jsonify({
            'status': 'error',
            'error': g_err.message
        }), g_err.status_code

    except Exception as exc:
        return jsonify({
            'status': 'error',
            'error': f"Failed to answer question from document: {str(exc)}"
        }), 500
