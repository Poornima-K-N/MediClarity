import os
import sys
import io
import unittest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pymupdf
from app import create_app
from app.config import Config

class TestDocumentProcessing(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()
        cls.fixtures_dir = os.path.join(os.path.dirname(__file__), 'fixtures')

    def test_health_check(self):
        """Verify health check endpoint returns 200 and limits metadata."""
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['limits']['max_file_size_mb'], 10)
        self.assertEqual(data['limits']['max_pdf_pages'], 10)

    def test_zero_cache_security_headers(self):
        """Verify Cache-Control: no-store and security headers are enforced."""
        res = self.client.get('/api/health')
        self.assertIn('no-store', res.headers.get('Cache-Control', ''))
        self.assertEqual(res.headers.get('Pragma'), 'no-cache')
        self.assertEqual(res.headers.get('X-Content-Type-Options'), 'nosniff')

    def test_extract_digital_pdf(self):
        """Verify instant high-fidelity text extraction for digital PDF."""
        file_path = os.path.join(self.fixtures_dir, 'synthetic_digital_report.pdf')
        with open(file_path, 'rb') as f:
            res = self.client.post(
                '/api/process-document',
                data={'file': (f, 'synthetic_digital_report.pdf')},
                content_type='multipart/form-data'
            )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['extraction_method'], 'digital_pdf')
        self.assertEqual(data['page_count'], 1)
        self.assertIn('Hemoglobin', data['extracted_text'])
        self.assertIn('Platelets', data['extracted_text'])

    def test_extract_scanned_pdf_fallback_to_ocr(self):
        """Verify selective fallback to OCR when PDF contains no digital text."""
        file_path = os.path.join(self.fixtures_dir, 'synthetic_scanned_report.pdf')
        with open(file_path, 'rb') as f:
            res = self.client.post(
                '/api/process-document',
                data={'file': (f, 'synthetic_scanned_report.pdf')},
                content_type='multipart/form-data'
            )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['extraction_method'], 'ocr_scanned_pdf')
        self.assertEqual(data['page_count'], 1)
        # Verify OCR recognized text from the image
        self.assertTrue('Amoxicillin' in data['extracted_text'] or 'Amox' in data['extracted_text'])

    def test_extract_hybrid_pdf(self):
        """Verify page-by-page selective OCR: Page 1 digital, Page 2 OCR."""
        file_path = os.path.join(self.fixtures_dir, 'synthetic_hybrid_report.pdf')
        with open(file_path, 'rb') as f:
            res = self.client.post(
                '/api/process-document',
                data={'file': (f, 'synthetic_hybrid_report.pdf')},
                content_type='multipart/form-data'
            )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['extraction_method'], 'hybrid_pdf')
        self.assertEqual(data['page_count'], 2)
        # Check page 1 is digital
        self.assertEqual(data['pages'][0]['method'], 'digital')
        self.assertIn('Electrolyte Panel', data['pages'][0]['text'])
        # Check page 2 is OCR
        self.assertEqual(data['pages'][1]['method'], 'ocr')

    def test_extract_image_ocr(self):
        """Verify direct OCR extraction for PNG prescription image."""
        file_path = os.path.join(self.fixtures_dir, 'synthetic_prescription.png')
        with open(file_path, 'rb') as f:
            res = self.client.post(
                '/api/process-document',
                data={'file': (f, 'synthetic_prescription.png')},
                content_type='multipart/form-data'
            )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['extraction_method'], 'ocr_image')
        self.assertTrue('Metformin' in data['extracted_text'] or 'PRESCRIPTION' in data['extracted_text'])

    def test_page_limit_enforcement(self):
        """Verify rejection when PDF exceeds 10-page limit."""
        # Generate an in-memory 12-page PDF
        doc = pymupdf.open()
        for i in range(12):
            p = doc.new_page(width=300, height=300)
            p.insert_text((30, 50), f"Page {i+1} test text", fontsize=10)
        pdf_bytes = doc.tobytes()
        doc.close()

        res = self.client.post(
            '/api/process-document',
            data={'file': (io.BytesIO(pdf_bytes), 'twelve_pages.pdf')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res.status_code, 422)
        data = res.get_json()
        self.assertIn('exceeds maximum limit of 10 pages', data['error'])

    def test_unsupported_file_extension(self):
        """Verify rejection of disallowed file extensions (e.g. .exe, .csv)."""
        res = self.client.post(
            '/api/process-document',
            data={'file': (io.BytesIO(b"fake data"), 'script.exe')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res.status_code, 415)
        data = res.get_json()
        self.assertIn('Unsupported file extension', data['error'])

    def test_spoofed_magic_bytes_rejection(self):
        """Verify rejection when a non-PDF file is disguised with a .pdf extension."""
        res = self.client.post(
            '/api/process-document',
            data={'file': (io.BytesIO(b"Plain text pretending to be a PDF"), 'fake.pdf')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res.status_code, 415)
        data = res.get_json()
        self.assertIn('Unsupported file format', data['error'])

    def test_corrupt_file_handling(self):
        """Verify graceful error handling on damaged files."""
        file_path = os.path.join(self.fixtures_dir, 'corrupt_file.pdf')
        with open(file_path, 'rb') as f:
            res = self.client.post(
                '/api/process-document',
                data={'file': (f, 'corrupt_file.pdf')},
                content_type='multipart/form-data'
            )
        self.assertEqual(res.status_code, 422)
        data = res.get_json()
        self.assertEqual(data['status'], 'error')


if __name__ == '__main__':
    unittest.main()
