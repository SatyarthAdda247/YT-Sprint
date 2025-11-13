# 🔌 API Reference - Frontend-Backend Handshaking

## Base URL
- **Local**: `http://localhost:5000/api`
- **Production**: `https://yt-sprint.vercel.app/api`

---

## Endpoints

### 1. Get Options (Dropdowns)
**GET** `/api/options`

Returns all verticals, exams, subjects for dropdown menus.

**Response:**
```json
{
  "verticals": ["Banking", "SSC", "Railway", ...],
  "categories_by_vertical": {
    "Banking": ["SBI PO", "IBPS PO", ...],
    "SSC": ["SSC CGL", "SSC CHSL", ...]
  },
  "subjects_by_vertical": {
    "Banking": ["Quant", "English", "Reasoning", ...],
    "SSC": ["Maths", "English", ...]
  },
  "content_subcategories": ["Shortcuts", "Tips & Tricks", ...]
}
```

---

### 2. Get Items (Filtered List)
**GET** `/api/metadata?vertical=Banking&exam=SBI PO&subject=Quant`

Returns filtered list of content items.

**Query Parameters:**
- `vertical` - Filter by vertical (optional)
- `exam` - Filter by exam (optional)
- `subject` - Filter by subject (optional)
- `contentType` - Filter by content type (optional)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "vertical": "Banking",
      "exam": "SBI PO",
      "subject": "Quant",
      "contentType": "Shorts",
      "status": "Final",
      "verificationLink": "https://youtube.com/...",
      "youtube_id": "abc123",
      "created_by": "user@example.com",
      "created_at": "2025-01-01T12:00:00",
      "updated_at": "2025-01-01T12:00:00"
    }
  ]
}
```

---

### 3. Create Item
**POST** `/api/item`

**Headers:**
- `Content-Type: application/json`
- `X-User-Email: user@example.com`

**Body:**
```json
{
  "vertical": "Banking",
  "exam": "SBI PO",
  "subject": "Quant",
  "contentType": "Shorts",
  "status": "Final",
  "verificationLink": "https://youtube.com/shorts/abc123",
  "contentSubcategory": "Shortcuts"
}
```

**Response (201):**
```json
{
  "item": { ... },
  "message": "Item created successfully"
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Video already exists (duplicate YouTube ID)
- `413` - Request too large (>20MB)
- `500` - S3 not configured or server error

---

### 4. Update Item
**PUT** `/api/item/:id`

**Headers:**
- `Content-Type: application/json`
- `X-User-Email: user@example.com`

**Body:**
```json
{
  "vertical": "Banking",
  "status": "Re-edit",
  "subject": "English"
}
```

**Response (200):**
```json
{
  "item": { ... },
  "message": "Item updated successfully"
}
```

**Errors:**
- `403` - Not authorized (can only edit own items)
- `404` - Item not found
- `500` - Server error

---

### 5. Delete Item
**DELETE** `/api/item/:id`

**Headers:**
- `X-User-Email: user@example.com`

**Response (200):**
```json
{
  "message": "Item deleted successfully"
}
```

**Errors:**
- `403` - Not authorized (can only delete own items)
- `404` - Item not found
- `500` - Server error

---

### 6. Check Duplicate
**GET** `/api/check-duplicate/:youtube_id`

Check if YouTube video already exists.

**Response (200):**
```json
{
  "exists": true,
  "item": { ... },
  "message": "Video already exists! Uploaded by: user@example.com"
}
```

Or:
```json
{
  "exists": false,
  "message": "Video not found in database"
}
```

---

## CORS Configuration

All endpoints support:
- **Origins**: `*` (all origins)
- **Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Headers**: `Content-Type, X-User-Email`

---

## Authentication

Currently using **email-based authorization**:
- Users can only edit/delete items they created
- Email passed via `X-User-Email` header
- Frontend gets email from user input

---

## Error Handling

All errors return JSON:
```json
{
  "error": "Descriptive error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `403` - Forbidden (authorization)
- `404` - Not found
- `409` - Conflict (duplicate)
- `413` - Payload too large
- `500` - Server error

---

## Environment Variables (Vercel)

Required for production:
```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
```

---

## Frontend Integration

```javascript
const API_BASE = '/api'

// Load options
const { data } = await axios.get(`${API_BASE}/options`)

// Load items
const { data } = await axios.get(`${API_BASE}/metadata?vertical=Banking`)

// Create item
await axios.post(`${API_BASE}/item`, payload, {
  headers: { 
    'Content-Type': 'application/json',
    'X-User-Email': userEmail
  }
})

// Update item
await axios.put(`${API_BASE}/item/${id}`, payload, {
  headers: { 
    'Content-Type': 'application/json',
    'X-User-Email': userEmail
  }
})

// Delete item
await axios.delete(`${API_BASE}/item/${id}`, {
  headers: { 'X-User-Email': userEmail }
})

// Check duplicate
const { data } = await axios.get(`${API_BASE}/check-duplicate/${youtubeId}`)
```

---

## Testing

```bash
# Get options
curl https://yt-sprint.vercel.app/api/options

# Get items
curl https://yt-sprint.vercel.app/api/metadata

# Create item
curl -X POST https://yt-sprint.vercel.app/api/item \
  -H "Content-Type: application/json" \
  -H "X-User-Email: test@example.com" \
  -d '{"vertical":"Banking","exam":"SBI PO","subject":"Quant","contentType":"Shorts","status":"Final","verificationLink":"https://youtube.com/shorts/abc123"}'
```

---

## Architecture

```
Frontend (React)
    ↓
  /api/* requests
    ↓
Vercel Routing (vercel.json)
    ↓
Serverless Functions (Python)
    ↓
AWS S3 (Storage)
```

**Benefits:**
✅ Single repo deployment
✅ No separate backend server
✅ Automatic scaling
✅ CORS handled
✅ Fast CDN delivery

