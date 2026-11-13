import re
import pymupdf
import pytesseract
from PIL import Image, ImageOps
from ..config import Config
from .validator import ValidationError

# Ensure pytesseract uses the configured tesseract executable
if Config.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = Config.TESSERACT_CMD


def clean_extracted_text(raw_text):
    """
    Normalizes extracted text:
    - Strips non-printable control characters except standard whitespace.
    - Consolidates multiple redundant blank lines.
    - Strips leading/trailing whitespace.
    """
    if not raw_text:
        return ""

    # Replace carriage returns
    text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Remove control characters except tab and newline
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)

    # Collapse more than two consecutive newlines into two
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def extract_from_image(file_path):
    """
    Extracts text from a single image (PNG/JPEG) using Tesseract OCR.
    Includes EXIF orientation correction and grayscale contrast enhancement.
    """
    try:
        with Image.open(file_path) as raw_img:
            # Correct orientation from mobile phone cameras (EXIF tag 274)
            img = ImageOps.exif_transpose(raw_img)
            if img is None:
                img = raw_img

            # Convert to grayscale for cleaner OCR character separation
            if img.mode != 'L':
                img = img.convert('L')

            ocr_text = pytesseract.image_to_string(img, config='--oem 3 --psm 3')
    except Exception as e:
        raise ValidationError(f"OCR engine could not process image: {str(e)}", 422)

    cleaned_text = clean_extracted_text(ocr_text)

    if not cleaned_text:
        raise ValidationError(
            "No readable text could be recognized from this image. Please ensure the prescription or report is well-lit, in focus, and legible.",
            422
        )

    words = cleaned_text.split()
    return {
        'extraction_method': 'ocr_image',
        'page_count': 1,
        'word_count': len(words),
        'char_count': len(cleaned_text),
        'extracted_text': cleaned_text,
        'pages': [
            {
                'page_number': 1,
                'method': 'ocr',
                'word_count': len(words),
                'char_count': len(cleaned_text),
                'text': cleaned_text
            }
        ]
    }


def extract_from_pdf(file_path):
    """
    Extracts text from a PDF with selective page-by-page hybrid handling:
    - Pages with extractable digital text use PyMuPDF directly.
    - Pages with low or no digital text (scanned/images) render to 200 DPI pixmaps
      and trigger Tesseract OCR selectively.
    """
    try:
        doc = pymupdf.open(file_path)
    except Exception as e:
        raise ValidationError(f"Could not open PDF file: {str(e)}", 422)

    pages_output = []
    total_digital_pages = 0
    total_ocr_pages = 0

    try:
        for page_idx in range(doc.page_count):
            page_num = page_idx + 1
            page = doc[page_idx]

            # 1. Try digital text extraction
            raw_digital = page.get_text("text") or ""
            cleaned_digital = clean_extracted_text(raw_digital)

            # If digital text meets or exceeds threshold, use digital extraction
            if len(cleaned_digital) >= Config.PAGE_DIGITAL_TEXT_THRESHOLD:
                words = cleaned_digital.split()
                pages_output.append({
                    'page_number': page_num,
                    'method': 'digital',
                    'word_count': len(words),
                    'char_count': len(cleaned_digital),
                    'text': cleaned_digital
                })
                total_digital_pages += 1
            else:
                # 2. Page has little or no digital text -> Selective OCR fallback
                try:
                    # Render page to bitmap at 200 DPI for high OCR accuracy
                    pixmap = page.get_pixmap(dpi=Config.OCR_DPI)
                    img = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
                    
                    # Convert to grayscale
                    img_gray = img.convert('L')
                    page_ocr_raw = pytesseract.image_to_string(img_gray, config='--oem 3 --psm 3')
                    page_ocr_clean = clean_extracted_text(page_ocr_raw)
                    
                    # If OCR yielded text, keep it; otherwise fall back to any sparse digital text
                    final_page_text = page_ocr_clean or cleaned_digital
                    words = final_page_text.split()
                    
                    pages_output.append({
                        'page_number': page_num,
                        'method': 'ocr',
                        'word_count': len(words),
                        'char_count': len(final_page_text),
                        'text': final_page_text
                    })
                    total_ocr_pages += 1
                except Exception as ocr_err:
                    # Fallback to whatever digital text exists
                    words = cleaned_digital.split()
                    pages_output.append({
                        'page_number': page_num,
                        'method': 'digital_fallback',
                        'word_count': len(words),
                        'char_count': len(cleaned_digital),
                        'text': cleaned_digital
                    })
                    total_digital_pages += 1
    finally:
        if not doc.is_closed:
            doc.close()

    # Determine overall document extraction category
    if total_ocr_pages == 0:
        overall_method = 'digital_pdf'
    elif total_digital_pages == 0:
        overall_method = 'ocr_scanned_pdf'
    else:
        overall_method = 'hybrid_pdf'

    # Combine text across all pages
    combined_sections = []
    total_words = 0
    total_chars = 0

    for p in pages_output:
        if p['text']:
            combined_sections.append(f"--- Page {p['page_number']} [{p['method'].upper()}] ---\n{p['text']}")
        total_words += p['word_count']
        total_chars += p['char_count']

    full_extracted_text = "\n\n".join(combined_sections).strip()

    if not full_extracted_text or total_words == 0:
        raise ValidationError(
            "No extractable text was found in this PDF document. The pages may be blank or scanned at too low a resolution.",
            422
        )

    return {
        'extraction_method': overall_method,
        'page_count': len(pages_output),
        'word_count': total_words,
        'char_count': total_chars,
        'extracted_text': full_extracted_text,
        'pages': pages_output
    }


def extract_document_text(file_path, detected_type):
    """
    Main dispatch function directing file to either PDF or image extractor.
    """
    if detected_type == 'pdf':
        return extract_from_pdf(file_path)
    elif detected_type in ('png', 'jpg', 'jpeg'):
        return extract_from_image(file_path)
    else:
        raise ValidationError("Unsupported file type for extraction.", 415)
