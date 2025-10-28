# Lead Import Guide

Complete guide for importing leads via CSV or Excel files.

## Overview

The lead import system allows you to bulk upload leads into the Wavelaunch CRM from CSV or Excel files. This feature supports:

- ✅ CSV files (.csv)
- ✅ Excel files (.xlsx, .xls)
- ✅ Duplicate detection (by email)
- ✅ Data validation
- ✅ Detailed import results
- ✅ Activity logging for each imported lead

## Quick Start

### 1. Download Template

Get the CSV template with proper formatting:

```bash
curl -O http://localhost:5000/api/v1/leads/import/template
```

Or via browser: `http://localhost:5000/api/v1/leads/import/template`

### 2. Fill Template

Edit the downloaded CSV file with your lead data. See format below.

### 3. Import File

```bash
curl -X POST http://localhost:5000/api/v1/leads/import \
  -F "file=@your-leads.csv"
```

## CSV/Excel Format

### Required Columns

- `name` - Full name of the lead **(required)**
- `email` - Email address **(required, unique)**

### Optional Columns

- `phone` - Phone number
- `niche` - Creator niche/category
- `followers` - Social media follower count (number)
- `engagement` - Engagement rate percentage (number)
- `platforms` - Comma-separated list (e.g., "instagram,youtube,tiktok")
- `stage` - Pipeline stage: Cold, Warm, Hot, Interested, Qualified
- `priority` - Lead priority: Low, Medium, High, Critical
- `summary` - Brief description or notes

### Example CSV

```csv
name,email,phone,niche,followers,engagement,platforms,stage,priority,summary
John Doe,john@example.com,+1-555-0123,Fitness,50000,4.5,"instagram,tiktok",Warm,High,Fitness coach interested in launching digital product
Jane Smith,jane@example.com,+1-555-0124,Beauty,120000,5.2,"youtube,instagram",Interested,High,Beauty influencer ready to scale brand
Mike Johnson,mike@example.com,+1-555-0125,Tech,35000,3.8,"twitter,linkedin",Qualified,Medium,Tech expert wants to create course platform
```

### Example Excel

Create an Excel file with the same columns in the first row (header row), then add your lead data in subsequent rows.

## API Endpoints

### Import Leads

**POST** `/api/v1/leads/import`

Upload CSV or Excel file for bulk lead import.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file field with CSV/Excel file

**Response:**
```json
{
  "success": true,
  "message": "Imported 3 leads (0 duplicates skipped, 0 errors)",
  "results": {
    "total": 3,
    "success": ["uuid-1", "uuid-2", "uuid-3"],
    "duplicates": [],
    "errors": []
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/leads/import \
  -F "file=@leads.csv" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download Template

**GET** `/api/v1/leads/import/template`

Download CSV template with example data.

**Response:**
- Content-Type: text/csv
- File: lead-import-template.csv

**cURL Example:**
```bash
curl -O http://localhost:5000/api/v1/leads/import/template
```

**Browser:**
```
http://localhost:5000/api/v1/leads/import/template
```

## Import Process

1. **File Upload** - System accepts CSV or Excel file
2. **Parsing** - File is parsed and converted to lead objects
3. **Validation** - Each lead is validated:
   - Name and email are required
   - Email format must be valid
   - Numeric fields are converted properly
4. **Duplicate Check** - System checks for existing leads by email
5. **Creation** - Valid, non-duplicate leads are created
6. **Activity Log** - Each imported lead gets an activity log entry
7. **Results** - Detailed results returned with success/error breakdown

## Field Mapping

| CSV Column | Database Field | Type | Required | Notes |
|------------|----------------|------|----------|-------|
| name | name | String | Yes | Full name |
| email | email | String | Yes | Must be unique |
| phone | phone | String | No | Any format accepted |
| niche | niche | String | No | Creator category |
| followers | socialFollowers | Integer | No | Parsed from string |
| engagement | engagementRate | Float | No | Parsed from string |
| platforms | platforms | Array | No | Split by comma |
| stage | stage | Enum | No | Cold/Warm/Hot/Interested/Qualified |
| priority | priority | Enum | No | Low/Medium/High/Critical |
| summary | summary | Text | No | Free-form notes |

## Data Validation

### Email Validation
```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Stage Values
- Cold
- Warm
- Hot
- Interested
- Qualified

*Default: 'Cold'*

### Priority Values
- Low
- Medium
- High
- Critical

*Default: 'Medium'*

## Error Handling

### Duplicate Detection

If a lead with the same email already exists:
```json
{
  "row": 2,
  "email": "existing@example.com",
  "error": "Duplicate email"
}
```

### Validation Errors

If required fields are missing:
```json
{
  "row": 3,
  "email": "invalid",
  "error": "Name and email are required"
}
```

### Invalid Email

If email format is invalid:
```json
{
  "row": 4,
  "email": "not-an-email",
  "error": "Invalid email format"
}
```

## Response Structure

```json
{
  "success": true,
  "message": "Imported 10 leads (2 duplicates skipped, 1 errors)",
  "results": {
    "total": 13,
    "success": [
      "uuid-1", "uuid-2", "uuid-3", ...
    ],
    "duplicates": [
      {
        "row": 5,
        "email": "duplicate@example.com",
        "error": "Duplicate email"
      }
    ],
    "errors": [
      {
        "row": 8,
        "email": "invalid",
        "error": "Invalid email format"
      }
    ]
  }
}
```

## Testing

### Test Files Available

The repository includes test files for development:

- `test-lead-import.csv` - Sample CSV with 3 leads
- `test-lead-import.xlsx` - Sample Excel with 3 leads
- `test-import-parsing.js` - Standalone test script

### Run Parsing Tests

Test CSV/Excel parsing without database:

```bash
cd backend
node test-import-parsing.js
```

This validates:
- ✅ CSV parsing works
- ✅ Excel parsing works
- ✅ Data structure is correct
- ✅ Required fields are present

### Full Integration Test

With database running:

```bash
# Start server
npm start

# Import test file
curl -X POST http://localhost:5000/api/v1/leads/import \
  -F "file=@test-lead-import.csv"

# Verify leads were created
curl http://localhost:5000/api/v1/leads
```

## Best Practices

1. **Use Template** - Always start with the provided template
2. **Validate Data** - Check data in Excel before importing
3. **Test Small** - Import 1-2 leads first to verify format
4. **Review Results** - Check the response for errors/duplicates
5. **Clean Duplicates** - Remove or fix duplicates before re-importing
6. **Backup First** - Export existing leads before large imports

## Troubleshooting

### "No file uploaded" Error

**Problem:** File not included in request

**Solution:** Ensure you're using `-F "file=@filename"` in cURL or proper multipart form in frontend

### "Invalid file type" Error

**Problem:** File type not supported

**Solution:** Only CSV (.csv) and Excel (.xlsx, .xls) are supported

### "Failed to parse CSV" Error

**Problem:** CSV format is invalid

**Solution:**
- Check for proper comma separation
- Ensure quotes around fields with commas
- Verify no extra/missing columns

### "Failed to parse Excel" Error

**Problem:** Excel file is corrupted or invalid

**Solution:**
- Re-save file in Excel
- Try exporting as CSV instead
- Check file isn't password protected

### Many Duplicates

**Problem:** Leads already exist in system

**Solution:**
- Check existing leads before import
- Update existing leads instead of importing
- Use different email addresses

## Implementation Details

### File Processing Flow

```
User uploads file
    ↓
Multer receives file → saved to uploads/temp/
    ↓
File extension checked (.csv or .xlsx)
    ↓
Appropriate parser called (parseCSV or parseExcel)
    ↓
Array of lead objects created
    ↓
Each lead validated and checked for duplicates
    ↓
Valid leads inserted to database
    ↓
Activity logs created
    ↓
Temp file deleted
    ↓
Results returned to user
```

### Security

- File size limited to 10MB (configurable via `MAX_FILE_SIZE`)
- Only CSV and Excel formats accepted
- Files deleted after processing
- Email validation prevents injection
- Database transactions ensure data integrity

## Future Enhancements

Planned improvements:

- [ ] Background processing for large files (>1000 rows)
- [ ] Progress tracking for imports
- [ ] Email notifications when import completes
- [ ] Import history and audit log
- [ ] Field mapping customization
- [ ] Update existing leads option
- [ ] Dry-run mode to preview before importing
- [ ] Excel template download (in addition to CSV)

## Support

For issues or questions:
- Check TROUBLESHOOTING.md
- Review error messages in response
- Test with provided sample files
- Contact development team

---

**Created:** 2025-10-28
**Version:** 1.0.0
**Epic:** Lead Management
**Feature:** Bulk Import
