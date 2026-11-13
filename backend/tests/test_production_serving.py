import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app

class TestProductionServing(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()

    def test_root_serves_spa_index_html(self):
        """Verify GET / returns 200 and index.html content."""
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'MediClarity', res.data)
        self.assertIn(b'<div id="root"></div>', res.data)

    def test_spa_client_route_fallback(self):
        """Verify client-side routes like /history fall back to index.html."""
        res = self.client.get('/history')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'<div id="root"></div>', res.data)

    def test_service_worker_headers(self):
        """Verify GET /sw.js has Service-Worker-Allowed: / and javascript mime."""
        res = self.client.get('/sw.js')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get('Service-Worker-Allowed'), '/')
        self.assertIn('javascript', res.content_type)

    def test_webmanifest_mime(self):
        """Verify GET /manifest.webmanifest returns application/manifest+json."""
        res = self.client.get('/manifest.webmanifest')
        self.assertEqual(res.status_code, 200)
        self.assertIn('manifest+json', res.content_type)

    def test_api_404_returns_json_not_html(self):
        """Verify non-existent API routes return JSON 404, never SPA HTML."""
        res = self.client.get('/api/does-not-exist')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.content_type, 'application/json')
        data = res.get_json()
        self.assertEqual(data.get('status'), 'error')

    def test_root_health_check(self):
        """Verify GET /health returns 200 and healthy status for Render."""
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'healthy')

if __name__ == '__main__':
    unittest.main()
