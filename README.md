# Content Dashboard

A full-stack web application for managing content items with hierarchical categorization (vertical → category → subcategory), file uploads to S3, and user authentication.

## Features

- **User Authentication**: Signup/login with JWT tokens
- **Hierarchical Filtering**: Dropdown filters for Vertical, Category, and Subcategory
- **Content Management**: Add, edit, delete content items with metadata
- **File Upload**: Upload multiple files per item, stored in S3
- **User-specific Content**: Track who uploaded each item, filter by user
- **Bulk Operations**: 
  - Bulk upload items via CSV
  - Export filtered view as CSV
- **S3 Integration**: Files and metadata stored in AWS S3

## Project Structure

```
ytsprint/
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── parse_excel.py          # Excel parser script
├── .env.local              # Environment variables (generated)
├── parse-log.txt           # Parse log (generated)
└── sample-output/          # Initial parsed data (generated)
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- AWS S3 bucket with access credentials

### Step 1: Parse Excel File

The Excel file at the provided path will be parsed to extract:
- Content items (vertical, category, subcategory, links, etc.)
- S3 credentials (if present in the sheet)
- Initial dropdown options

```bash
cd /Users/adda247/Downloads/ytsprint
python3 parse_excel.py
```

This will:
- Create `.env.local` with S3 credentials
- Create `parse-log.txt` with parsing details
- Create `sample-output/` with initial data JSON

**⚠️ Security Note**: S3 credentials were found and saved to `.env.local`. Remove credentials from the spreadsheet after setup if desired.

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
pip3 install -r requirements.txt

# Run Flask server
python3 app.py
```

Backend will run at `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## Environment Variables

The `.env.local` file (auto-generated from Excel or using defaults):

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
S3_ENDPOINT=              # Optional, for S3-compatible services
JWT_SECRET=change-me-in-production
```

## API Endpoints

### Authentication

#### `POST /api/signup`
Create new user account.

**Request:**
```json
{
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "name": "John Doe"
  }
}
```

#### `POST /api/login`
Login existing user.

**Request:**
```json
{
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "name": "John Doe"
  }
}
```

### Content Management

All endpoints require `X-User-Name: <name>` header.

#### `GET /api/options`
Get dropdown options.

**Response:**
```json
{
  "verticals": ["Bank", "SSC", "Teaching"],
  "categories_by_vertical": {
    "Bank": ["IBPS PO", "SBI Clerk"]
  },
  "subcategories_by_category": {
    "IBPS PO": ["Exam Pattern", "Syllabus"]
  }
}
```

#### `GET /api/metadata`
Get filtered items.

**Query Parameters:**
- `vertical` (optional)
- `category` (optional)
- `subcategory` (optional)
- `user_only` (optional, boolean)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Item Title",
      "vertical": "Bank",
      "category": "IBPS PO",
      "subcategory": "Exam Pattern",
      "notes": "Description...",
      "links": ["https://..."],
      "files": ["files/user@example.com/uuid/filename.pdf"],
      "tags": ["important", "featured"],
      "created_by": "user@example.com",
      "created_at": "2025-11-12T20:00:00+05:30"
    }
  ]
}
```

#### `POST /api/item`
Create new item.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title` (required)
- `vertical` (required)
- `category` (optional)
- `subcategory` (optional)
- `notes` (optional)
- `links` (optional, comma-separated)
- `tags` (optional, comma-separated)
- `files[]` (optional, multiple files)

**Response:**
```json
{
  "item": { /* created item */ }
}
```

#### `PUT /api/item/:id`
Update existing item.

**Content-Type:** `multipart/form-data`

Same fields as POST, all optional except ownership check.

#### `DELETE /api/item/:id`
Delete item (only by owner).

**Response:**
```json
{
  "message": "Item deleted"
}
```

#### `GET /api/item/:id/download/:fileKey`
Get presigned URL for file download.

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/..."
}
```

### Bulk Operations

#### `POST /api/bulk-upload`
Bulk upload items from CSV.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (CSV file)

**CSV Format:**
```csv
title,vertical,category,subcategory,notes,links,tags
"Item 1","Bank","IBPS PO","Exam Pattern","Notes here","https://link1.com|https://link2.com","tag1,tag2"
```

**Response:**
```json
{
  "items_created": 10,
  "items": [ /* created items */ ]
}
```

#### `GET /api/export`
Export filtered view as CSV.

**Query Parameters:**
- `vertical` (optional)
- `category` (optional)
- `subcategory` (optional)

**Response:** CSV file download

## Example cURL Commands

### Signup
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","password":"test123"}'
```

### Get Options
```bash
curl http://localhost:5000/api/options \
  -H "X-User-Name: John Doe"
```

### Create Item
```bash
curl -X POST http://localhost:5000/api/item \
  -H "X-User-Name: John Doe" \
  -F "title=Test Item" \
  -F "vertical=Bank Pre" \
  -F "category=IBPS PO" \
  -F "subcategory=Reasoning" \
  -F "notes=Test notes" \
  -F "links=https://example.com" \
  -F "tags=test,demo" \
  -F "files=@/path/to/file.pdf"
```

### Get Items
```bash
curl "http://localhost:5000/api/metadata?vertical=Bank%20Pre&user_only=false" \
  -H "X-User-Name: John Doe"
```

### Export CSV
```bash
curl "http://localhost:5000/api/export?vertical=Bank%20Pre" \
  -H "X-User-Name: John Doe" \
  -o export.csv
```

## S3 Storage Layout

```
scriptiq-content/
├── metadata/
│   ├── index.json                    # Master index of all items
│   └── items/
│       ├── uuid-1.json              # Individual item metadata
│       └── uuid-2.json
└── files/
    ├── user1@example.com/
    │   └── uuid-1/
    │       ├── 1699800000_document.pdf
    │       └── 1699800001_image.png
    └── user2@example.com/
        └── uuid-2/
            └── 1699800100_video.mp4
```

## Security Considerations

### Production Deployment

1. **Environment Variables**: Use secure secret manager (AWS Secrets Manager, HashiCorp Vault)
2. **JWT Secret**: Change `JWT_SECRET` to a strong random value
3. **Database**: Replace in-memory `users_db` with PostgreSQL/MongoDB
4. **HTTPS**: Use SSL/TLS certificates
5. **CORS**: Restrict CORS to specific domains
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **File Validation**: Add virus scanning for uploaded files
8. **Private Network**: Deploy backend in VPC if auth is disabled

### Current Implementation

- In-memory user storage (development only)
- Simple JWT authentication
- File uploads validated by filename only
- No rate limiting

## Testing

See `tests/` directory for automated tests.

Run tests:
```bash
cd backend
python3 -m pytest tests/
```

## License

Proprietary - Adda247

