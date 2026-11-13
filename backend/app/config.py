import os
import shutil

# Simple .env loader for local development without external dependencies
def _load_dotenv():
    search_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), # backend/
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), # root/
    ]
    for d in search_dirs:
        env_path = os.path.join(d, '.env')
        if os.path.exists(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k, v = k.strip(), v.strip().strip('"').strip("'")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

_load_dotenv()


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

    # Gemini AI Configuration
    # Key is read strictly from backend environment variables
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY') or ''
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-3.8-flash')

    # Frontend distribution directory for production combined serving
    _dist_candidates = [
        os.environ.get('FRONTEND_DIST_DIR'),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist')),
        '/app/frontend/dist',
        '/app/dist',
    ]
    FRONTEND_DIST_DIR = next((d for d in _dist_candidates if d and os.path.exists(d)), _dist_candidates[1])
