import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from .config import Config
from .routes.document import document_bp

def create_app():
    dist_dir = Config.FRONTEND_DIST_DIR
    app = Flask(__name__, static_folder=dist_dir if os.path.exists(dist_dir) else None)
    app.config.from_object(Config)

    # Enable CORS for frontend dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register document processing routes
    app.register_blueprint(document_bp, url_prefix='/api')

    # Top-level health check endpoint for Render health checks
    @app.route('/health', methods=['GET'])
    def root_health():
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

    # Production combined service: Serve React SPA, PWA assets, and Service Worker
    if os.path.exists(dist_dir):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            # Do not intercept API or health endpoints
            if path.startswith('api/') or path == 'api' or path == 'health':
                return jsonify({'status': 'error', 'error': 'Endpoint not found.'}), 404

            # Check if requesting a static asset file in dist
            target_path = os.path.join(dist_dir, path)
            if path and os.path.exists(target_path) and not os.path.isdir(target_path):
                resp = send_from_directory(dist_dir, path)
                if path == 'sw.js':
                    resp.headers['Service-Worker-Allowed'] = '/'
                    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                    resp.mimetype = 'application/javascript'
                elif path.endswith('.webmanifest') or path == 'manifest.webmanifest':
                    resp.mimetype = 'application/manifest+json'
                    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                elif path.startswith('assets/'):
                    resp.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
                return resp

            # Otherwise return index.html for SPA client-side routes
            resp = send_from_directory(dist_dir, 'index.html')
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return resp

    # Enforce Zero-Cache Security Headers on all API responses
    @app.after_request
    def set_security_and_no_cache_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        if request.path.startswith('/api'):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        return response

    # Handle file size ceiling exceeded (HTTP 413)
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            'status': 'error',
            'error': f'The uploaded document exceeds the maximum allowed file size of {Config.MAX_CONTENT_LENGTH // (1024 * 1024)} MB.'
        }), 413

    # Handle 404
    @app.errorhandler(404)
    def not_found(error):
        if request.path.startswith('/api'):
            return jsonify({
                'status': 'error',
                'error': 'Endpoint not found.'
            }), 404
        if os.path.exists(dist_dir):
            return send_from_directory(dist_dir, 'index.html')
        return jsonify({
            'status': 'error',
            'error': 'Endpoint not found.'
        }), 404

    return app
