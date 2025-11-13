from http.server import BaseHTTPRequestHandler
import json
import sys
import os
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
    
    def _send_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS request"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Check for duplicate YouTube video"""
        try:
            # Extract video ID from path
            video_id = self.path.split('/')[-1].split('?')[0]
            
            if not video_id:
                self._send_response(400, {'error': 'Video ID is required'})
                return
            
            # Check S3 for duplicates
            if s3:
                index = get_s3_object('metadata/index.json')
                if index:
                    for item in index.get('items', []):
                        if item.get('youtube_id') == video_id:
                            self._send_response(200, {
                                'exists': True,
                                'item': item,
                                'message': f'Video already exists! Uploaded by: {item.get("created_by", "Unknown")}'
                            })
                            return
            
            # Not found
            self._send_response(200, {
                'exists': False,
                'message': 'Video not found in database'
            })
            
        except Exception as e:
            print(f"Error checking duplicate: {e}")
            self._send_response(500, {'error': f'Server error: {str(e)}'})
