from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from backend.master_data import get_all_verticals, get_exams_by_vertical, get_subjects_by_vertical, get_content_subcategories

class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
    
    def do_OPTIONS(self):
        """Handle OPTIONS request"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Get dropdown options"""
        try:
            # Get verticals
            verticals = get_all_verticals()
            
            # Build categories by vertical
            categories_by_vertical = {}
            for vertical in verticals:
                categories_by_vertical[vertical] = get_exams_by_vertical(vertical)
            
            # Build subjects by vertical
            subjects_by_vertical = {}
            for vertical in verticals:
                subjects_by_vertical[vertical] = get_subjects_by_vertical(vertical)
            
            # Get content subcategories
            content_subcategories = get_content_subcategories()
            
            response = {
                'verticals': verticals,
                'categories_by_vertical': categories_by_vertical,
                'subjects_by_vertical': subjects_by_vertical,
                'content_subcategories': content_subcategories
            }
            
            # Send success response
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': f'Failed to load options: {str(e)}'
            }).encode())
