# Troubleshooting Guide

## Error: "Cannot read properties of undefined (reading 'define')" in Credential.js

### Issue
```
TypeError: Cannot read properties of undefined (reading 'define')
    at Object.<anonymous> (/path/to/wavelaunch-crm/backend/src/models/Credential.js:27:30)
```

### Cause
This error occurs when the `encryption.js` utility file is missing or the latest code hasn't been pulled from the repository.

### Solution

**Step 1: Pull the latest changes**
```bash
cd wavelaunch-crm
git pull origin claude/session-011CUZNvQnUiXwWfextX5AZ3
```

**Step 2: Verify encryption.js exists**
```bash
ls -la backend/src/utils/encryption.js
```

You should see:
```
-rw-r--r--  1 user  staff  7234 Dec 10 10:00 backend/src/utils/encryption.js
```

**Step 3: Set up encryption keys**
```bash
cd backend

# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and add it to your `.env` file:
```bash
# Add to backend/.env
ENCRYPTION_MASTER_KEY=<paste_your_generated_key_here>
ENCRYPTION_SALT=wavelaunch-studio-salt-2024
```

**Step 4: Restart the server**
```bash
npm run dev
```

You should see:
```
🔐 Validating credential encryption system...
✓ Credential encryption system validated successfully
✓ Database connection established successfully
✓ Database synchronized
✅ Server is running successfully!
```

---

## Error: "ENCRYPTION_MASTER_KEY environment variable is not set"

### Issue
Server fails to start with encryption validation error.

### Solution

Generate and add encryption key to `.env`:
```bash
cd backend

# Generate key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
echo "ENCRYPTION_MASTER_KEY=<your_key_here>" >> .env
echo "ENCRYPTION_SALT=wavelaunch-studio-salt-2024" >> .env
```

---

## Error: Database connection failed

### Issue
```
✗ Unable to connect to database
```

### Solution

1. **Check PostgreSQL is running**
```bash
# On macOS
brew services start postgresql@14

# On Linux
sudo systemctl start postgresql
```

2. **Verify database exists**
```bash
psql -U postgres -c "CREATE DATABASE wavelaunch_crm;"
```

3. **Check .env configuration**
```bash
# backend/.env should have:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wavelaunch_crm
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Quick Health Check

Run this to verify everything is set up correctly:

```bash
cd wavelaunch-crm/backend

# Check all required files exist
test -f src/utils/encryption.js && echo "✓ Encryption utility exists" || echo "✗ Missing encryption.js"
test -f src/models/Credential.js && echo "✓ Credential model exists" || echo "✗ Missing Credential.js"
test -f src/controllers/credentialController.js && echo "✓ Credential controller exists" || echo "✗ Missing credentialController.js"
test -f .env && echo "✓ .env file exists" || echo "✗ Missing .env file"

# Check encryption key is set
grep -q "ENCRYPTION_MASTER_KEY" .env && echo "✓ Encryption key configured" || echo "✗ Encryption key missing"

# Try starting server
npm run dev
```

---

## Still Having Issues?

1. **Clear node_modules and reinstall**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node.js version**
```bash
node --version  # Should be v16 or higher
```

3. **View server logs**
```bash
cd backend
npm run dev 2>&1 | tee server.log
```

4. **Test database connection**
```bash
cd backend
node -e "require('./src/config/database').testConnection()"
```

---

## Support

If issues persist:
1. Check the commit history: `git log --oneline --name-only -10`
2. Verify you're on the correct branch: `git branch`
3. Review the detailed documentation in `CREDENTIALS_SYSTEM.md`
