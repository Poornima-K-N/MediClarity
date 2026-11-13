from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .routes.document import document_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register document processing routes
    app.register_blueprint(document_bp, url_prefix='/api')

    # Enforce Zero-Cache Security Headers on all API responses
    @app.after_request
    def set_security_and_no_cache_headers(response):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
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
        return jsonify({
            'status': 'error',
            'error': 'Endpoint not found.'
        }), 404

    return app
