# Business Plan Generator - Web UI Guide

A user-friendly web interface for generating business plans. Perfect for non-technical users!

## 🚀 Quick Start (For Managers)

### 1. Start the Application

**On Mac/Linux:**
```bash
./start_web.sh
```

**On Windows:**
```bash
start_web.bat
```

Or double-click the `start_web.bat` file.

### 2. Open Your Browser

Once the server starts, you'll see:
```
🚀 Starting server...

📍 Open your browser and go to:

   http://localhost:5000
```

Open your browser and navigate to: **http://localhost:5000**

### 3. Choose Your Input Method

You'll see two options:

- **Form Input**: Fill out a web form with all the business details
- **File Upload**: Upload a JSON, CSV, or TXT file with the information

### 4. Generate Your Business Plan

- Fill in the required fields (marked with *)
- Check the options for PDF and Pitch Deck generation
- Click "Generate Business Plan"
- Wait 10-20 minutes for the AI to generate your plan
- Download the generated files!

## 📋 Features

### Two Input Methods

#### 1. Form Input
- User-friendly web form
- Organized into logical sections
- Required field validation
- Preview executive summary before full generation
- Auto-save (data saved locally in your browser)

#### 2. File Upload
- Drag and drop file support
- Accepts JSON, CSV, or TXT files
- Sample files provided for reference
- Instant generation after upload

### Generation Options

- ✅ **Markdown Document**: Editable business plan (always generated)
- ✅ **PDF Document**: Professional, investor-ready PDF (optional)
- ✅ **Pitch Deck**: Presentation slides PDF (optional)

### Real-time Feedback

- Progress indicators during generation
- Clear error messages if something goes wrong
- Download buttons for all generated files
- Success confirmations

## 📝 Using the Form

### Required Fields

Minimum information needed for a business plan:

1. **Full Name** - Your name
2. **Email** - Contact email
3. **Venture Vision** - Your business idea/vision
4. **Target Industry** - Industry or niche
5. **Target Audience** - Who are your customers
6. **Unique Value Proposition** - What makes you unique

### Optional but Recommended

For the best results, fill out as many fields as possible:

- **Personal Information**: Career milestones, turning points
- **Venture Details**: Demographics, pain points
- **Competition**: Competitors, differentiation
- **Branding**: Image, personality, values
- **Growth**: Goals, strategy, vision
- **Timeline**: Milestones and deadlines

**Tip**: The more detail you provide, the better your business plan!

## 📂 Using File Upload

### Supported Formats

#### JSON Format
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "venture_vision": "AI-powered sustainable fashion",
  "target_industry": "Fashion Tech",
  ...
}
```

#### CSV Format
```csv
full_name,email,venture_vision,target_industry
"Jane Doe","jane@example.com","AI platform","Fashion Tech"
```

#### Plain Text Format
```
Full Name: Jane Doe
Email: jane@example.com
Venture Vision: AI-powered sustainable fashion
Target Industry: Fashion Tech
```

### Sample Files

Download sample files from the upload page to see the exact format needed.

## ⚙️ Generation Options Explained

### Generate PDF
When checked, creates a professionally branded PDF in addition to Markdown.

**When to use:**
- Need investor-ready document
- Want polished, formatted output
- Printing or sharing as attachment

### Generate Pitch Deck
When checked, creates a separate pitch deck PDF with presentation slides.

**When to use:**
- Preparing for investor meetings
- Need visual presentation
- Want condensed version for pitches

## ⏱️ Generation Time

| Option | Time |
|--------|------|
| Executive Summary Preview | 30 seconds - 1 minute |
| Full Business Plan (Markdown only) | 10-15 minutes |
| Full Plan + PDF | 15-20 minutes |
| Full Plan + PDF + Pitch Deck | 20-25 minutes |

**Why so long?**
The AI is writing 50+ pages of strategic content, creating visualizations, and formatting everything professionally. Good things take time!

## 💾 Downloading Your Files

After generation completes:

1. A success modal will appear
2. Click the download button for each file type
3. Files are saved to your Downloads folder
4. Files are named with the creator's name (e.g., `business-plan-jane-doe.pdf`)

## ❓ Troubleshooting

### Server Won't Start

**Problem**: Error when running start script

**Solution**:
1. Make sure Python 3.8+ is installed: `python --version`
2. Check if port 5000 is available (close other apps using it)
3. Try running manually: `python app.py`

### "API Key Not Found" Error

**Problem**: Environment validation fails

**Solution**:
1. Make sure `.env` file exists in the project folder
2. Check that API keys are properly set:
   ```
   ANTHROPIC_API_KEY=sk-ant-api...
   ```
3. Restart the server after adding keys

### Generation Fails

**Problem**: Error during business plan generation

**Solution**:
1. Check all required fields are filled
2. Verify your API key is valid
3. Check your internet connection
4. Try generating executive summary first (faster, tests setup)

### Page Won't Load

**Problem**: Browser shows "Can't connect" error

**Solution**:
1. Make sure the server is running (check terminal/command prompt)
2. Try http://localhost:5000 or http://127.0.0.1:5000
3. Check firewall isn't blocking port 5000
4. Restart the server

### PDF Generation Fails

**Problem**: Markdown generated but PDF failed

**Solution**:
1. This is usually okay - you still have the Markdown!
2. PDF requires system dependencies (Cairo, Pango)
3. On Mac: `brew install cairo pango gdk-pixbuf`
4. On Ubuntu: `sudo apt-get install libcairo2 libpango-1.0-0`
5. Or uncheck "Generate PDF" and just use Markdown

## 🔒 Privacy & Security

### Your Data

- All processing happens on your computer
- No data is sent anywhere except to OpenAI/Anthropic APIs for content generation
- Files are saved only on your local machine
- Form data auto-save uses browser local storage (stays on your computer)

### API Keys

- Stored in `.env` file on your computer
- Never exposed to the browser
- Used only for AI content generation
- Keep them private - don't share with others

## 💡 Tips for Best Results

### 1. Be Specific
❌ "Fashion business"
✅ "Sustainable artisan fashion marketplace connecting eco-conscious consumers with verified independent creators"

### 2. Include Numbers
❌ "Good revenue goals"
✅ "Year 1: $1M GMV, Year 2: $5M GMV, Year 3: $25M GMV"

### 3. Name Real Competitors
❌ "Other marketplaces"
✅ "Etsy, Faire, The Citizenry"

### 4. Tell Your Story
❌ "Experience in industry"
✅ "15 years in fashion retail, former VP at $50M brand, launched successful $10M e-commerce platform"

### 5. Use the Preview
- Generate executive summary first
- Review the output quality
- Add more details if needed
- Then generate full plan

## 🎯 Workflow Recommendations

### For Quick Review
1. Fill out just the required fields
2. Click "Preview Executive Summary"
3. Review in 1-2 minutes
4. Iterate on your input if needed

### For Full Business Plan
1. Fill out all fields thoroughly
2. Check "Generate PDF"
3. Click "Generate Business Plan"
4. Get coffee ☕ (takes 15-20 minutes)
5. Download and review
6. Edit Markdown if needed

### For Investor Pitch
1. Fill out complete form with all details
2. Check both "Generate PDF" and "Generate Pitch Deck"
3. Generate and wait 20-25 minutes
4. Get comprehensive package:
   - Full business plan (PDF)
   - Editable Markdown
   - Pitch deck slides
   - All data visualizations

## 🛠️ Advanced: Running Manually

If the startup scripts don't work:

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## 📞 Getting Help

### Common Questions

**Q: Can I edit the generated plan?**
A: Yes! The Markdown file is fully editable. Edit it and regenerate PDF if needed.

**Q: How much does it cost?**
A: You only pay for the API usage (OpenAI/Anthropic). About $3-7 per full business plan.

**Q: Can I generate multiple plans?**
A: Yes! Generate as many as you need. Each one is independent.

**Q: Is the content unique?**
A: Yes! Each plan is custom-generated based on your specific input.

**Q: Can I use this offline?**
A: No, it needs internet to connect to AI APIs. But it runs on your computer (localhost).

### Still Need Help?

1. Check the main README.md for detailed documentation
2. Review the USAGE_GUIDE.md for advanced options
3. Check server terminal/console for error messages
4. Verify all dependencies are installed

## 🎓 Tutorial Walkthrough

### First Time User - Step by Step

1. **Start the server**
   - Run `start_web.sh` or `start_web.bat`
   - Wait for "Starting server..." message
   - Note the URL: http://localhost:5000

2. **Open your browser**
   - Use Chrome, Firefox, or Safari
   - Go to http://localhost:5000
   - You should see "Business Plan Generator" page

3. **Choose Form Input**
   - Click "Form Input" in the navigation
   - You'll see the full form

4. **Fill minimum required fields**
   - Full Name: "Sarah Johnson"
   - Email: "sarah@example.com"
   - Venture Vision: "Premium artisan marketplace"
   - Target Industry: "Sustainable Fashion"
   - Target Audience: "Eco-conscious millennials, 25-45"
   - Unique Value Proposition: "Connect consumers with verified artisan creators"

5. **Try the preview**
   - Click "Preview Executive Summary"
   - Wait ~1 minute
   - Review the generated summary
   - Close the preview

6. **Generate full plan**
   - Check "Generate PDF"
   - Click "Generate Business Plan"
   - Wait 15-20 minutes
   - See progress indicator

7. **Download your files**
   - Success modal appears
   - Click "Download" for Markdown
   - Click "Download" for PDF
   - Files saved to Downloads folder

8. **Review and iterate**
   - Open the PDF and review
   - If you want changes, update the form and regenerate

Congratulations! You've generated your first business plan! 🎉

---

**Need the command-line version?** See the main README.md

**Want to customize?** See USAGE_GUIDE.md for advanced options

**Ready to start?** Run the startup script and open http://localhost:5000! 🚀
