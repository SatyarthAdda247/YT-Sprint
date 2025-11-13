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
    try:
        response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=key)
        return json.loads(response['Body'].read().decode('utf-8'))
    except:
        return None

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Extract video ID from path
        video_id = self.path.split('/')[-1]
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
        self.end_headers()
        
        # Check S3 for duplicates
        if s3:
            index = get_s3_object('metadata/index.json')
            if index:
                for item in index.get('items', []):
                    if item.get('youtube_id') == video_id:
                        response = {'exists': True, 'item': item}
                        self.wfile.write(json.dumps(response).encode())
                        return
        
        response = {'exists': False}
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
        self.end_headers()

