# Changelog

## v2.0.0 - YouTube Duplicate Detection & Adda247 Form (Nov 12, 2025)

### 🎨 Major UI Changes

**Form Updated to Match Adda247 Design**:
- ✅ Email Address field (validated for @adda247.com, @addaeducation.com, @studyiq.com)
- ✅ Verification Link with "Check Link" button
- ✅ Type of Content dropdown (Exam_Information, Content, Motivational_or_Fun)
- ✅ Vertical Name dropdown
- ✅ Exam Name dropdown (cascading based on vertical)
- ✅ Status dropdown (Draft, Pending, Final, Published)
- ✅ Red accent color matching Adda247 branding

### 🔍 YouTube Duplicate Detection

**Using Regex Pattern Matching**:
```regex
(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})
```

**Supported YouTube URLs**:
- ✅ `https://youtube.com/shorts/ABC123XYZ99`
- ✅ `https://youtube.com/watch?v=ABC123XYZ99`
- ✅ `https://youtu.be/ABC123XYZ99`

**Features**:
- Extracts YouTube video ID from URL
- Checks database for existing video before submission
- Shows who uploaded the duplicate video
- Requires link verification before submission
- Prevents duplicate video entries

### 🛡️ New Backend Endpoints

#### `GET /api/check-duplicate/:video_id`
Check if YouTube video ID already exists.

**Response if duplicate found**:
```json
{
  "exists": true,
  "item": {
    "id": "...",
    "created_by": "Test User",
    "verificationLink": "...",
    ...
  }
}
```

**Response if unique**:
```json
{
  "exists": false
}
```

### 📝 Data Model Changes

**New Item Structure**:
```json
{
  "id": "uuid",
  "email": "user@adda247.com",
  "verificationLink": "https://youtube.com/shorts/...",
  "youtube_id": "ABC123XYZ99",
  "contentType": "Exam_Information",
  "vertical": "Bank Pre",
  "exam": "IBPS PO",
  "status": "Final",
  "created_by": "User Name",
  "created_at": "2025-11-12T..."
}
```

### ✅ Validations Added

1. **Email Domain Validation**:
   - Only @adda247.com, @addaeducation.com, @studyiq.com allowed
   
2. **YouTube Link Validation**:
   - Must be valid YouTube URL
   - Must extract 11-character video ID
   - Must click "Check Link" before submitting
   
3. **Duplicate Prevention**:
   - Checks YouTube ID before creation
   - Returns 409 Conflict if duplicate found
   - Shows who uploaded the original

### 🎯 User Experience Improvements

- ✅ Real-time link verification
- ✅ Visual feedback with checkmark when link verified
- ✅ Status badges with color coding (Published=green, Final=blue, Pending=yellow)
- ✅ Clear error messages for duplicates
- ✅ Cascading dropdowns (Vertical → Exam)
- ✅ All fields now required for submission

### 🧪 Testing Results

**Test 1: Create Item with YouTube Link**
```bash
curl -X POST http://localhost:5001/api/item \
  -H "X-User-Name: Test User" \
  -F "email=test@adda247.com" \
  -F "verificationLink=https://youtube.com/shorts/ABC123XYZ99" \
  -F "contentType=Exam_Information" \
  -F "vertical=Bank Pre" \
  -F "exam=IBPS PO" \
  -F "status=Final"
```
✅ Result: Item created with youtube_id="ABC123XYZ99"

**Test 2: Check for Duplicate**
```bash
curl http://localhost:5001/api/check-duplicate/ABC123XYZ99 \
  -H "X-User-Name: Test User"
```
✅ Result: Returns exists=true with item details

**Test 3: Attempt to Create Duplicate**
```bash
curl -X POST http://localhost:5001/api/item \
  -H "X-User-Name: Another User" \
  -F "email=another@adda247.com" \
  -F "verificationLink=https://youtube.com/shorts/ABC123XYZ99" \
  -F "contentType=Content" \
  -F "vertical=SSC" \
  -F "exam=CHSL" \
  -F "status=Draft"
```
✅ Result: 409 Error - "This video already exists! Uploaded by: Test User"

### 📊 Regex Patterns Used

**YouTube ID Extraction**:
```regex
(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})
```

**Explanation**:
- `(?:...)` - Non-capturing group
- `youtube\.com\/(?:shorts\/|watch\?v=)` - Matches youtube.com/shorts/ or youtube.com/watch?v=
- `|` - OR
- `youtu\.be\/` - Matches youtu.be/
- `([a-zA-Z0-9_-]{11})` - Captures exactly 11 character video ID

### 🔄 Migration Notes

**Existing Data**:
- Old items without `youtube_id` will continue to work
- New submissions require YouTube link
- Email field now mandatory
- Status field now mandatory

### 🐛 Bug Fixes

- Fixed form field naming consistency
- Fixed cascading dropdown logic
- Improved error messages
- Better validation feedback

### 📁 Files Modified

- `frontend/src/App.jsx` - Complete form redesign
- `backend/app.py` - Added duplicate checking and YouTube ID extraction
- Both pushed to GitHub

### 🚀 Deployment

Code pushed to: https://github.com/SatyarthAdda247/YT-Sprint

To update running instance:
```bash
# Backend
cd backend
git pull
# Restart server

# Frontend
cd frontend
git pull
npm run build
```

---

## Previous Version (v1.0.0)

- Basic content management
- Simple form with title, notes, links, tags
- No duplicate detection
- Generic styling

