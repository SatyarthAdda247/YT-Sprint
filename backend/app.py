import os
import json
import uuid
import time
import hashlib
from datetime import datetime
from functools import wraps
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from dotenv import load_dotenv
from master_data import get_all_verticals, get_exams_by_vertical, get_subjects_by_vertical

load_dotenv('../.env.local')

app = Flask(__name__)
CORS(app)

# Config
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
S3_ENDPOINT = os.getenv('S3_ENDPOINT', None)

# S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
    endpoint_url=S3_ENDPOINT
)

# Password helpers
def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

# Auth decorator
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_name = request.headers.get('X-User-Name')
        if not user_name:
            return jsonify({'error': 'User name required'}), 401
        
        request.user_name = user_name
        return f(*args, **kwargs)
    return decorated

# S3 helpers
def get_s3_object(key):
    """Get object from S3"""
    try:
        response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=key)
        return json.loads(response['Body'].read().decode('utf-8'))
    except s3.exceptions.NoSuchKey:
        return None
    except Exception as e:
        print(f"S3 get error: {e}")
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

def upload_file_to_s3(file, item_id, user_name):
    """Upload file to S3"""
    try:
        filename = secure_filename(file.filename)
        timestamp = int(time.time())
        key = f"files/{user_name}/{item_id}/{timestamp}_{filename}"
        
        s3.upload_fileobj(
            file,
            S3_BUCKET_NAME,
            key,
            ExtraArgs={'ContentType': file.content_type or 'application/octet-stream'}
        )
        return key
    except Exception as e:
        print(f"S3 upload error: {e}")
        return None

def get_index():
    """Get or create index"""
    index = get_s3_object('metadata/index.json')
    if index is None:
        index = {'items': [], 'updated_at': datetime.now().isoformat()}
    return index

def update_index(index):
    """Update index atomically"""
    index['updated_at'] = datetime.now().isoformat()
    return put_s3_object('metadata/index.json', index)

# User management
def get_user(name):
    """Get user from S3"""
    name_key = name.lower().replace(' ', '_')
    return get_s3_object(f"users/{name_key}.json")

def save_user(name, password_hash):
    """Save user to S3"""
    name_key = name.lower().replace(' ', '_')
    user_data = {
        'name': name,
        'password_hash': password_hash,
        'created_at': datetime.now().isoformat()
    }
    return put_s3_object(f"users/{name_key}.json", user_data)

# Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    """User signup with name and password"""
    data = request.json
    name = data.get('name', '').strip()
    password = data.get('password', '')
    
    if not name or not password:
        return jsonify({'error': 'Name and password required'}), 400
    
    # Check if user exists
    existing_user = get_user(name)
    if existing_user:
        return jsonify({'error': 'User already exists. Please login instead.'}), 400
    
    # Hash password and save user
    password_hash = hash_password(password)
    save_user(name, password_hash)
    
    return jsonify({'user': {'name': name}})

@app.route('/api/login', methods=['POST'])
def login():
    """User login with name and password"""
    data = request.json
    name = data.get('name', '').strip()
    password = data.get('password', '')
    
    if not name or not password:
        return jsonify({'error': 'Name and password required'}), 400
    
    # Get user from S3
    user = get_user(name)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({'user': {'name': name}})

@app.route('/api/options', methods=['GET'])
@require_auth
def get_options():
    """Get dropdown options from master data"""
    verticals = get_all_verticals()
    
    # Build categories (exams) by vertical
    categories_by_vertical = {}
    for vertical in verticals:
        categories_by_vertical[vertical] = get_exams_by_vertical(vertical)
    
    # Build subcategories (subjects) by category/exam
    # For simplicity, we'll map subjects to vertical level
    subcategories_by_vertical = {}
    for vertical in verticals:
        subcategories_by_vertical[vertical] = get_subjects_by_vertical(vertical)
    
    return jsonify({
        'verticals': verticals,
        'categories_by_vertical': categories_by_vertical,
        'subcategories_by_vertical': subcategories_by_vertical
    })

@app.route('/api/metadata', methods=['GET'])
@require_auth
def get_metadata():
    """Get filtered items"""
    vertical = request.args.get('vertical', '')
    category = request.args.get('category', '')
    subcategory = request.args.get('subcategory', '')
    user_only = request.args.get('user_only', 'false').lower() == 'true'
    
    index = get_index()
    items = index.get('items', [])
    
    # Filter
    filtered = []
    for item in items:
        if vertical and item.get('vertical') != vertical:
            continue
        if category and item.get('category') != category:
            continue
        if subcategory and item.get('subcategory') != subcategory:
            continue
        if user_only and item.get('created_by') != request.user_name:
            continue
        filtered.append(item)
    
    return jsonify({'items': filtered})

@app.route('/api/item', methods=['POST'])
@require_auth
def create_item():
    """Create new item"""
    # Get form data
    title = request.form.get('title', '').strip()
    vertical = request.form.get('vertical', '').strip()
    category = request.form.get('category', '').strip()
    subcategory = request.form.get('subcategory', '').strip()
    notes = request.form.get('notes', '').strip()
    links_str = request.form.get('links', '')
    tags_str = request.form.get('tags', '')
    
    if not title or not vertical:
        return jsonify({'error': 'Title and vertical required'}), 400
    
    # Parse links and tags
    links = [l.strip() for l in links_str.split(',') if l.strip()]
    tags = [t.strip() for t in tags_str.split(',') if t.strip()]
    
    # Create item
    item_id = str(uuid.uuid4())
    item = {
        'id': item_id,
        'title': title,
        'vertical': vertical,
        'category': category,
        'subcategory': subcategory,
        'notes': notes,
        'links': links,
        'tags': tags,
        'files': [],
        'created_by': request.user_name,
        'created_at': datetime.now().isoformat()
    }
    
    # Handle file uploads
    files = request.files.getlist('files')
    for file in files:
        if file.filename:
            key = upload_file_to_s3(file, item_id, request.user_name)
            if key:
                item['files'].append(key)
    
    # Save item metadata
    put_s3_object(f"metadata/items/{item_id}.json", item)
    
    # Update index
    index = get_index()
    index['items'].append(item)
    update_index(index)
    
    return jsonify({'item': item}), 201

@app.route('/api/item/<item_id>', methods=['PUT'])
@require_auth
def update_item(item_id):
    """Update item"""
    # Get existing item
    item = get_s3_object(f"metadata/items/{item_id}.json")
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check ownership
    if item.get('created_by') != request.user_name:
        return jsonify({'error': 'Not authorized'}), 403
    
    # Update fields
    if 'title' in request.form:
        item['title'] = request.form['title'].strip()
    if 'vertical' in request.form:
        item['vertical'] = request.form['vertical'].strip()
    if 'category' in request.form:
        item['category'] = request.form['category'].strip()
    if 'subcategory' in request.form:
        item['subcategory'] = request.form['subcategory'].strip()
    if 'notes' in request.form:
        item['notes'] = request.form['notes'].strip()
    if 'links' in request.form:
        item['links'] = [l.strip() for l in request.form['links'].split(',') if l.strip()]
    if 'tags' in request.form:
        item['tags'] = [t.strip() for t in request.form['tags'].split(',') if t.strip()]
    
    # Handle new file uploads
    files = request.files.getlist('files')
    for file in files:
        if file.filename:
            key = upload_file_to_s3(file, item_id, request.user_name)
            if key:
                item['files'].append(key)
    
    item['updated_at'] = datetime.now().isoformat()
    
    # Save item
    put_s3_object(f"metadata/items/{item_id}.json", item)
    
    # Update index
    index = get_index()
    for i, idx_item in enumerate(index['items']):
        if idx_item['id'] == item_id:
            index['items'][i] = item
            break
    update_index(index)
    
    return jsonify({'item': item})

@app.route('/api/item/<item_id>', methods=['DELETE'])
@require_auth
def delete_item(item_id):
    """Delete item"""
    # Get item
    item = get_s3_object(f"metadata/items/{item_id}.json")
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check ownership
    if item.get('created_by') != request.user_name:
        return jsonify({'error': 'Not authorized'}), 403
    
    # Delete files from S3
    for file_key in item.get('files', []):
        try:
            s3.delete_object(Bucket=S3_BUCKET_NAME, Key=file_key)
        except Exception as e:
            print(f"Error deleting file {file_key}: {e}")
    
    # Delete metadata
    try:
        s3.delete_object(Bucket=S3_BUCKET_NAME, Key=f"metadata/items/{item_id}.json")
    except Exception as e:
        print(f"Error deleting metadata: {e}")
    
    # Update index
    index = get_index()
    index['items'] = [i for i in index['items'] if i['id'] != item_id]
    update_index(index)
    
    return jsonify({'message': 'Item deleted'}), 200

@app.route('/api/item/<item_id>/download/<path:file_key>', methods=['GET'])
@require_auth
def download_file(item_id, file_key):
    """Generate presigned URL for file download"""
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': file_key},
            ExpiresIn=3600
        )
        return jsonify({'url': url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bulk-upload', methods=['POST'])
@require_auth
def bulk_upload():
    """Bulk upload items from CSV"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files allowed'}), 400
    
    # Parse CSV
    import csv
    from io import StringIO
    
    content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    
    items_created = []
    index = get_index()
    
    for row in reader:
        item_id = str(uuid.uuid4())
        item = {
            'id': item_id,
            'title': row.get('title', '').strip(),
            'vertical': row.get('vertical', '').strip(),
            'category': row.get('category', '').strip(),
            'subcategory': row.get('subcategory', '').strip(),
            'notes': row.get('notes', '').strip(),
            'links': [l.strip() for l in row.get('links', '').split('|') if l.strip()],
            'tags': [t.strip() for t in row.get('tags', '').split(',') if t.strip()],
            'files': [],
            'created_by': request.user_name,
            'created_at': datetime.now().isoformat()
        }
        
        if item['title'] and item['vertical']:
            put_s3_object(f"metadata/items/{item_id}.json", item)
            index['items'].append(item)
            items_created.append(item)
    
    update_index(index)
    
    return jsonify({'items_created': len(items_created), 'items': items_created}), 201

@app.route('/api/export', methods=['GET'])
@require_auth
def export_csv():
    """Export filtered view as CSV"""
    import csv
    from io import StringIO
    
    vertical = request.args.get('vertical', '')
    category = request.args.get('category', '')
    subcategory = request.args.get('subcategory', '')
    
    index = get_index()
    items = index.get('items', [])
    
    # Filter
    filtered = []
    for item in items:
        if vertical and item.get('vertical') != vertical:
            continue
        if category and item.get('category') != category:
            continue
        if subcategory and item.get('subcategory') != subcategory:
            continue
        filtered.append(item)
    
    # Generate CSV
    output = StringIO()
    fieldnames = ['id', 'title', 'vertical', 'category', 'subcategory', 'notes', 'links', 'tags', 'created_by', 'created_at']
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for item in filtered:
        writer.writerow({
            'id': item.get('id', ''),
            'title': item.get('title', ''),
            'vertical': item.get('vertical', ''),
            'category': item.get('category', ''),
            'subcategory': item.get('subcategory', ''),
            'notes': item.get('notes', ''),
            'links': '|'.join(item.get('links', [])),
            'tags': ','.join(item.get('tags', [])),
            'created_by': item.get('created_by', ''),
            'created_at': item.get('created_at', '')
        })
    
    output.seek(0)
    return output.getvalue(), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=export.csv'
    }

if __name__ == '__main__':
    app.run(debug=True, port=5001)
