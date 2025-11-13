from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid
from datetime import datetime
import re
import boto3
from io import BytesIO
import cgi

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# AWS Configuration from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# Max file size: 20MB for shorts
MAX_FILE_SIZE = 20 * 1024 * 1024

# Initialize S3 client
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

def put_s3_object(key, data):
    """Put object to S3"""
    try:
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=key,
            Body=json.dumps(data, indent=2),
            ContentType='application/json'
        )
        return True
    except Exception as e:
        print(f"S3 put error: {e}")
        return False

def get_index():
    """Get or create index"""
    index = get_s3_object('metadata/index.json')
    if index is None:
        index = {'items': [], 'updated_at': datetime.now().isoformat()}
    return index

def update_index(index):
    """Update index"""
    index['updated_at'] = datetime.now().isoformat()
    return put_s3_object('metadata/index.json', index)

def extract_youtube_id(url):
    """Extract YouTube video ID"""
    pattern = r'(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else None

class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        try:
            # Check content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Enforce 20MB limit
            if content_length > MAX_FILE_SIZE:
                self.send_response(413)
                self._send_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'File too large. Maximum 20MB allowed for shorts.'
                }).encode())
                return
            
            # Read request body
            body = self.rfile.read(content_length)
            
            # Parse form data
            try:
                data = json.loads(body.decode('utf-8'))
            except:
                # Handle form-data if needed
                data = {}
            
            # Get user email
            user_email = self.headers.get('X-User-Email', 'anonymous@adda247.com')
            
            # Validate required fields
            vertical = data.get('vertical', '').strip()
            content_type = data.get('contentType', '').strip()
            exam = data.get('exam', '').strip()
            status = data.get('status', '').strip()
            
            if not vertical or not content_type or not exam or not status:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
                return
            
            # Extract YouTube ID if link provided
            verification_link = data.get('verificationLink', '').strip()
            youtube_id = None
            if verification_link:
                youtube_id = extract_youtube_id(verification_link)
            
            # Check for duplicate if YouTube ID exists
            if youtube_id and s3:
                index = get_index()
                for item in index.get('items', []):
                    if item.get('youtube_id') == youtube_id:
                        self.send_response(409)
                        self._send_cors_headers()
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'error': f'Video already exists! Uploaded by: {item.get("created_by")}'
                        }).encode())
                        return
            
            # Create item
            item_id = str(uuid.uuid4())
            item = {
                'id': item_id,
                'email': data.get('email', user_email),
                'verificationLink': verification_link,
                'youtube_id': youtube_id,
                'contentType': content_type,
                'vertical': vertical,
                'exam': exam,
                'subject': data.get('subject', ''),
                'status': status,
                'contentSubcategory': data.get('contentSubcategory', ''),
                'files': [],
                'videoFile': None,
                'created_by': user_email,
                'created_at': datetime.now().isoformat()
            }
            
            # Save to S3 if configured
            if s3:
                put_s3_object(f"metadata/items/{item_id}.json", item)
                index = get_index()
                index['items'].append(item)
                update_index(index)
            
            # Success response
            self.send_response(201)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'item': item}).encode())
            
        except Exception as e:
            print(f"Error in POST: {e}")
            self.send_response(500)
            self._send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_GET(self):
        self.send_response(405)
        self._send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'Use POST to create items'}).encode())

