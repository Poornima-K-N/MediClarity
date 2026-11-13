import os
from ..config import Config

class ValidationError(Exception):
    """Base exception for document validation errors."""
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class PageLimitExceededError(ValidationError):
    def __init__(self, current_pages, max_pages=Config.MAX_PDF_PAGES):
        super().__init__(
            f"Document exceeds maximum limit of {max_pages} pages (uploaded document has {current_pages} pages). Please upload relevant report pages.",
            status_code=422
        )


class DocumentEncryptedError(ValidationError):
    def __init__(self):
        super().__init__(
            "This PDF is password-protected or encrypted. Please upload an unlocked medical document.",
            status_code=422
        )


class CorruptDocumentError(ValidationError):
    def __init__(self, detail=""):
        msg = "The uploaded file appears to be corrupted or in an unreadable format."
        if detail:
            msg += f" ({detail})"
        super().__init__(msg, status_code=422)


def get_file_extension(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''


def validate_file_header_magic_bytes(file_path):
    """
    Inspects the initial binary bytes of the file on disk to prevent
    mime-spoofing or malicious extension masquerading.
    """
    if not os.path.exists(file_path):
        raise ValidationError("Uploaded file not found on server.", 400)

    size = os.path.getsize(file_path)
    if size == 0:
        raise ValidationError("Uploaded file is empty (0 bytes).", 400)

    if size > Config.MAX_CONTENT_LENGTH:
        raise ValidationError(
            f"File size exceeds the 10 MB limit ({round(size / (1024*1024), 2)} MB).",
            413
        )

    with open(file_path, 'rb') as f:
        header = f.read(16)

    # Magic byte signatures
    is_pdf = header.startswith(b'%PDF-')
    is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
    is_jpeg = header.startswith(b'\xff\xd8\xff')

    if is_pdf:
        return 'pdf'
    elif is_png:
        return 'png'
    elif is_jpeg:
        return 'jpg'
    else:
        raise ValidationError(
            "Unsupported file format. Please upload a genuine PDF, PNG, or JPEG medical document.",
            415
        )


def validate_document_structure(file_path, detected_type):
    """
    Performs deep structural integrity verification using PyMuPDF and Pillow.
    Ensures PDFs are not password-encrypted and within the 10-page limit.
    """
    if detected_type == 'pdf':
        try:
            import pymupdf
        except ImportError:
            raise ValidationError("PDF parsing engine is unavailable.", 500)

        try:
            doc = pymupdf.open(file_path)
        except Exception as e:
            raise CorruptDocumentError(f"Cannot read PDF structure: {str(e)}")

        try:
            if doc.is_encrypted:
                doc.close()
                raise DocumentEncryptedError()

            page_count = doc.page_count
            if page_count == 0:
                doc.close()
                raise CorruptDocumentError("PDF contains no readable pages.")

            if page_count > Config.MAX_PDF_PAGES:
                doc.close()
                raise PageLimitExceededError(page_count, Config.MAX_PDF_PAGES)

            return {
                'file_type': 'pdf',
                'page_count': page_count,
            }
        finally:
            if not doc.is_closed:
                doc.close()

    elif detected_type in ('png', 'jpg', 'jpeg'):
        try:
            from PIL import Image
        except ImportError:
            raise ValidationError("Image parsing engine is unavailable.", 500)

        try:
            with Image.open(file_path) as img:
                img.verify()
                format_name = img.format.lower() if img.format else detected_type
            return {
                'file_type': 'image',
                'format': format_name,
                'page_count': 1,
            }
        except Exception as e:
            raise CorruptDocumentError(f"Invalid or corrupted image: {str(e)}")

    raise ValidationError("Unsupported document format.", 415)
