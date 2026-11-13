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
    extract_structured_medical_data
)

document_bp = Blueprint('document', __name__)

@document_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'MediClarity AI Document Processing & Gemini Extraction Engine',
        'version': '3.0.0',
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

    should_analyze_ai = request.form.get('analyze_ai') == 'true'

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

            ai_analysis = None
            ai_error = None

            # Optional automatic Gemini analysis if requested and key is present
            if should_analyze_ai:
                if Config.GEMINI_API_KEY:
                    try:
                        ai_analysis = extract_structured_medical_data(extraction_result['extracted_text'])
                    except GeminiError as g_err:
                        ai_error = g_err.message
                    except Exception as e:
                        ai_error = f"Gemini extraction error: {str(e)}"
                else:
                    ai_error = "Gemini API key is not configured in backend environment variables."

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
                'ai_analysis': ai_analysis,
                'ai_error': ai_error,
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
    Dedicated endpoint to analyze already-extracted medical text via Gemini API.
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
