from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid
from datetime import datetime
import re
import boto3
from urllib.parse import urlparse

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
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
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
    
    def do_POST(self):
        """Create new item"""
        try:
            # Check S3 configuration
            if not s3:
                self._send_response(500, {
                    'error': 'S3 not configured. Please set AWS credentials in Vercel environment variables.'
                })
                return
            
            # Check content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Enforce 20MB limit
            if content_length > MAX_FILE_SIZE:
                self._send_response(413, {
                    'error': 'Request too large. Maximum 20MB allowed. Please use YouTube link instead of file upload.'
                })
                return
            
            # Read request body
            body = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(body.decode('utf-8'))
            except:
                self._send_response(400, {'error': 'Invalid JSON data'})
                return
            
            # Get user email
            user_email = self.headers.get('X-User-Email', 'anonymous@adda247.com')
            
            # Validate required fields
            vertical = data.get('vertical', '').strip()
            content_type = data.get('contentType', '').strip()
            exam = data.get('exam', '').strip()
            status = data.get('status', '').strip()
            verification_link = data.get('verificationLink', '').strip()
            
            if not vertical or not content_type or not exam or not status:
                self._send_response(400, {
                    'error': 'Missing required fields: vertical, contentType, exam, status'
                })
                return
            
            if not verification_link:
                self._send_response(400, {
                    'error': 'YouTube link is required'
                })
                return
            
            # Extract YouTube ID
            youtube_id = extract_youtube_id(verification_link)
            if not youtube_id:
                self._send_response(400, {
                    'error': 'Invalid YouTube link. Please provide a valid youtube.com or youtu.be link.'
                })
                return
            
            # Check for duplicate
            index = get_index()
            for item in index.get('items', []):
                if item.get('youtube_id') == youtube_id:
                    self._send_response(409, {
                        'error': f'Video already exists! Uploaded by: {item.get("created_by", "Unknown")}'
                    })
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
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Save to S3
            put_s3_object(f"metadata/items/{item_id}.json", item)
            index['items'].append(item)
            update_index(index)
            
            # Success response
            self._send_response(201, {'item': item, 'message': 'Item created successfully'})
            
        except Exception as e:
            print(f"Error in POST: {e}")
            self._send_response(500, {'error': f'Server error: {str(e)}'})
    
    def do_PUT(self):
        """Update existing item"""
        try:
            # Check S3 configuration
            if not s3:
                self._send_response(500, {
                    'error': 'S3 not configured. Please set AWS credentials in Vercel environment variables.'
                })
                return
            
            # Get item ID from path
            parsed = urlparse(self.path)
            path_parts = parsed.path.rstrip('/').split('/')
            item_id = path_parts[-1] if len(path_parts) > 0 else None
            
            if not item_id:
                self._send_response(400, {'error': 'Item ID is required'})
                return
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(body.decode('utf-8'))
            except:
                self._send_response(400, {'error': 'Invalid JSON data'})
                return
            
            # Get user email
            user_email = self.headers.get('X-User-Email', 'anonymous@adda247.com')
            
            # Get existing item
            existing_item = get_s3_object(f"metadata/items/{item_id}.json")
            if not existing_item:
                self._send_response(404, {'error': 'Item not found'})
                return
            
            # Check authorization
            if existing_item.get('created_by') != user_email:
                self._send_response(403, {
                    'error': 'Not authorized: You can only edit items you created'
                })
                return
            
            # Update item fields
            existing_item.update({
                'vertical': data.get('vertical', existing_item.get('vertical')),
                'exam': data.get('exam', existing_item.get('exam')),
                'subject': data.get('subject', existing_item.get('subject')),
                'contentType': data.get('contentType', existing_item.get('contentType')),
                'status': data.get('status', existing_item.get('status')),
                'contentSubcategory': data.get('contentSubcategory', existing_item.get('contentSubcategory')),
                'verificationLink': data.get('verificationLink', existing_item.get('verificationLink')),
                'updated_at': datetime.now().isoformat()
            })
            
            # Update YouTube ID if link changed
            if data.get('verificationLink'):
                youtube_id = extract_youtube_id(data['verificationLink'])
                existing_item['youtube_id'] = youtube_id
            
            # Save to S3
            put_s3_object(f"metadata/items/{item_id}.json", existing_item)
            
            # Update index
            index = get_index()
            for i, item in enumerate(index.get('items', [])):
                if item.get('id') == item_id:
                    index['items'][i] = existing_item
                    break
            update_index(index)
            
            # Success response
            self._send_response(200, {'item': existing_item, 'message': 'Item updated successfully'})
            
        except Exception as e:
            print(f"Error in PUT: {e}")
            self._send_response(500, {'error': f'Server error: {str(e)}'})
    
    def do_DELETE(self):
        """Delete item"""
        try:
            # Check S3 configuration
            if not s3:
                self._send_response(500, {
                    'error': 'S3 not configured. Please set AWS credentials in Vercel environment variables.'
                })
                return
            
            # Get item ID from path
            parsed = urlparse(self.path)
            path_parts = parsed.path.rstrip('/').split('/')
            item_id = path_parts[-1] if len(path_parts) > 0 else None
            
            if not item_id:
                self._send_response(400, {'error': 'Item ID is required'})
                return
            
            # Get user email
            user_email = self.headers.get('X-User-Email', 'anonymous@adda247.com')
            
            # Get existing item
            existing_item = get_s3_object(f"metadata/items/{item_id}.json")
            if not existing_item:
                self._send_response(404, {'error': 'Item not found'})
                return
            
            # Check authorization
            if existing_item.get('created_by') != user_email:
                self._send_response(403, {
                    'error': 'Not authorized: You can only delete items you created'
                })
                return
            
            # Delete from S3
            try:
                s3.delete_object(Bucket=S3_BUCKET_NAME, Key=f"metadata/items/{item_id}.json")
            except:
                pass
            
            # Update index
            index = get_index()
            index['items'] = [item for item in index.get('items', []) if item.get('id') != item_id]
            update_index(index)
            
            # Success response
            self._send_response(200, {'message': 'Item deleted successfully'})
            
        except Exception as e:
            print(f"Error in DELETE: {e}")
            self._send_response(500, {'error': f'Server error: {str(e)}'})
    
    def do_GET(self):
        """Not allowed - use /api/metadata instead"""
        self._send_response(405, {
            'error': 'Method not allowed. Use POST to create, PUT to update, DELETE to remove. Use /api/metadata to list items.'
        })
