# Quick Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 18+
- AWS S3 bucket access

## Setup Steps

### 1. Parse Excel (Optional - creates initial data)
```bash
python3 parse_excel.py
```
This extracts S3 credentials to `.env.local`

### 2. Start Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```
Backend runs at `http://localhost:5000`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

## Usage

### First Time User
1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Enter your name and create a password
4. Start uploading content

### Returning User
1. Click "Login"
2. Enter your name and password
3. All your previous uploads will be displayed

## Features

- **Name-based accounts**: Simple login with name + password
- **Auto-load history**: When you login, your previous uploads appear automatically
- **Hierarchical filters**: Vertical → Exam → Subject
- **File uploads**: Multiple files per item, stored in S3
- **User isolation**: See only your uploads with "Show only my uploads" checkbox
- **Bulk operations**: Import CSV, export CSV

## S3 Storage Structure

```
scriptiq-content/
├── users/
│   ├── john_doe.json          # User credentials
│   └── jane_smith.json
├── metadata/
│   ├── index.json             # All items
│   └── items/
│       ├── uuid-1.json        # Item metadata
│       └── uuid-2.json
└── files/
    ├── John Doe/              # Files by user
    │   └── uuid-1/
    │       └── file.pdf
    └── Jane Smith/
        └── uuid-2/
            └── document.pdf
```

## Security Notes

- User passwords are hashed (SHA256) before storage
- All user data stored in S3
- JWT tokens valid for 30 days
- Each user can only edit/delete their own content

## Master Data

The system includes pre-configured verticals:
- Bank Pre, Bank Post
- SSC
- Teaching
- UGC
- Bihar, Punjab, Odia, Telugu, Tamil, Bengal
- Agriculture

Each vertical has predefined exams and subjects loaded from `master_data.py`.

