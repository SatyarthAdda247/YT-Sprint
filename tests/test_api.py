import pytest
import sys
import os
import json
from io import BytesIO

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_token(client):
    """Create a test user and return auth token"""
    response = client.post('/api/signup', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    data = json.loads(response.data)
    return data['token']

def test_signup(client):
    """Test user signup"""
    response = client.post('/api/signup', json={
        'name': 'New User',
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data
    assert data['user']['email'] == 'newuser@example.com'

def test_login(client):
    """Test user login"""
    # First signup
    client.post('/api/signup', json={
        'name': 'Login Test',
        'email': 'login@example.com',
        'password': 'pass123'
    })
    
    # Then login
    response = client.post('/api/login', json={
        'email': 'login@example.com',
        'password': 'pass123'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data

def test_login_invalid(client):
    """Test login with invalid credentials"""
    response = client.post('/api/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpass'
    })
    
    assert response.status_code == 401

def test_get_options_requires_auth(client):
    """Test that /api/options requires authentication"""
    response = client.get('/api/options')
    assert response.status_code == 401

def test_get_options(client, auth_token):
    """Test getting dropdown options"""
    response = client.get('/api/options', headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'verticals' in data
    assert 'categories_by_vertical' in data
    assert 'subcategories_by_category' in data

def test_create_item(client, auth_token):
    """Test creating a new item"""
    data = {
        'title': 'Test Item',
        'vertical': 'Bank',
        'category': 'IBPS PO',
        'subcategory': 'Exam Pattern',
        'notes': 'Test notes',
        'links': 'https://example.com',
        'tags': 'test,demo'
    }
    
    response = client.post('/api/item', data=data, headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert response.status_code == 201
    result = json.loads(response.data)
    assert result['item']['title'] == 'Test Item'
    assert result['item']['vertical'] == 'Bank'
    
    return result['item']['id']

def test_create_item_with_file(client, auth_token):
    """Test creating item with file upload"""
    data = {
        'title': 'Test Item with File',
        'vertical': 'SSC',
        'category': 'CHSL',
        'notes': 'Test with file',
    }
    
    # Create a test file
    file_content = b'Test file content'
    data['files'] = (BytesIO(file_content), 'test.txt')
    
    response = client.post('/api/item', 
        data=data,
        content_type='multipart/form-data',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    assert response.status_code == 201
    result = json.loads(response.data)
    assert len(result['item']['files']) > 0

def test_get_metadata(client, auth_token):
    """Test getting filtered metadata"""
    # First create an item
    client.post('/api/item', data={
        'title': 'Filter Test',
        'vertical': 'Teaching',
        'category': 'CTET'
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    # Get all items
    response = client.get('/api/metadata', headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'items' in data
    assert len(data['items']) > 0

def test_get_metadata_filtered(client, auth_token):
    """Test getting filtered metadata by vertical"""
    # Create items
    client.post('/api/item', data={
        'title': 'Bank Item',
        'vertical': 'Bank',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    client.post('/api/item', data={
        'title': 'SSC Item',
        'vertical': 'SSC',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    # Filter by vertical
    response = client.get('/api/metadata?vertical=Bank', headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert all(item['vertical'] == 'Bank' for item in data['items'])

def test_update_item(client, auth_token):
    """Test updating an item"""
    # Create item
    create_response = client.post('/api/item', data={
        'title': 'Original Title',
        'vertical': 'Bank',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    item_id = json.loads(create_response.data)['item']['id']
    
    # Update item
    update_response = client.put(f'/api/item/{item_id}', data={
        'title': 'Updated Title'
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    assert update_response.status_code == 200
    result = json.loads(update_response.data)
    assert result['item']['title'] == 'Updated Title'

def test_delete_item(client, auth_token):
    """Test deleting an item"""
    # Create item
    create_response = client.post('/api/item', data={
        'title': 'To Be Deleted',
        'vertical': 'Bank',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    item_id = json.loads(create_response.data)['item']['id']
    
    # Delete item
    delete_response = client.delete(f'/api/item/{item_id}', headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert delete_response.status_code == 200

def test_export_csv(client, auth_token):
    """Test CSV export"""
    # Create an item
    client.post('/api/item', data={
        'title': 'Export Test',
        'vertical': 'Bank',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    # Export
    response = client.get('/api/export', headers={
        'Authorization': f'Bearer {auth_token}'
    })
    
    assert response.status_code == 200
    assert 'text/csv' in response.content_type
    assert b'title' in response.data  # CSV header

def test_bulk_upload(client, auth_token):
    """Test bulk CSV upload"""
    csv_content = b"""title,vertical,category,subcategory,notes,links,tags
Item 1,Bank,IBPS PO,Exam Pattern,Notes 1,https://link1.com,tag1
Item 2,SSC,CHSL,Syllabus,Notes 2,https://link2.com,tag2"""
    
    data = {
        'file': (BytesIO(csv_content), 'test.csv')
    }
    
    response = client.post('/api/bulk-upload',
        data=data,
        content_type='multipart/form-data',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    assert response.status_code == 201
    result = json.loads(response.data)
    assert result['items_created'] == 2

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

