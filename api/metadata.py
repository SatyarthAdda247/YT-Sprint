from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs, urlparse
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

s3 = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
) if AWS_ACCESS_KEY_ID else None

def get_s3_object(key):
    """Get object from S3"""
    try:
        response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=key)
        return json.loads(response['Body'].read().decode('utf-8'))
    except:
        return None

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
        """Get filtered items"""
        try:
            # Parse query parameters
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            
            # Get filters from query params
            vertical = params.get('vertical', [''])[0]
            exam = params.get('exam', [''])[0]
            subject = params.get('subject', [''])[0]
            content_type = params.get('contentType', [''])[0]
            
            # Get items from S3
            items = []
            if s3:
                index = get_s3_object('metadata/index.json')
                if index and 'items' in index:
                    items = index['items']
                    
                    # Apply filters
                    if vertical:
                        items = [item for item in items if item.get('vertical', '') == vertical]
                    if exam:
                        items = [item for item in items if item.get('exam', '') == exam]
                    if subject:
                        items = [item for item in items if item.get('subject', '') == subject]
                    if content_type:
                        items = [item for item in items if item.get('contentType', '') == content_type]
            
            # Send response
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'items': items}).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': f'Failed to load items: {str(e)}'
            }).encode())
