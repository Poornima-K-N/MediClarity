import os
import shutil

class Config:
    # 10 MB strict file upload ceiling
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    
    # Maximum pages allowed per PDF to prevent resource exhaustion & OCR timeouts
    MAX_PDF_PAGES = 10
    
    # Supported document extensions
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    
    # Characters threshold per page to distinguish digital vs scanned pages
    PAGE_DIGITAL_TEXT_THRESHOLD = 30
    
    # OCR resolution in DPI for rendering scanned PDF pages to bitmaps
    OCR_DPI = 200
    
    # Tesseract OCR executable detection
    # Checks environment variable, system PATH, or standard Windows installation directory
    _env_tesseract = os.environ.get('TESSERACT_CMD')
    _win_default_tesseract = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    _path_tesseract = shutil.which('tesseract')

    if _env_tesseract and os.path.exists(_env_tesseract):
        TESSERACT_CMD = _env_tesseract
    elif _path_tesseract:
        TESSERACT_CMD = _path_tesseract
    elif os.path.exists(_win_default_tesseract):
        TESSERACT_CMD = _win_default_tesseract
    else:
        TESSERACT_CMD = 'tesseract'
