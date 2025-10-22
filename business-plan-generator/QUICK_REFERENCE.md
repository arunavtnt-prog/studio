# Quick Reference Card

## For Non-Technical Users (Managers)

### 🚀 How to Start the Web Interface

**On Mac/Linux:**
1. Open Terminal
2. Navigate to the business-plan-generator folder
3. Run: `./start_web.sh`
4. Open browser: http://localhost:5000

**On Windows:**
1. Open the business-plan-generator folder
2. Double-click: `start_web.bat`
3. Open browser: http://localhost:5000

### 📝 How to Generate a Business Plan

1. **Fill the Form**
   - Required fields are marked with *
   - Fill at least: Name, Email, Venture Vision, Industry, Audience, Value Proposition
   - More details = better plan!

2. **Choose Options**
   - ✅ Generate PDF (recommended)
   - ⬜ Generate Pitch Deck (optional)

3. **Click Generate**
   - Wait 15-20 minutes
   - Watch the progress bar
   - Get coffee ☕

4. **Download Files**
   - Click download buttons when ready
   - Get Markdown and PDF files
   - Review and use!

### 💡 Pro Tips

- **Preview First**: Click "Preview Executive Summary" to test (only 1 minute!)
- **Save Time**: Use file upload if you already have data in JSON/CSV/TXT
- **Be Specific**: "Sustainable artisan fashion marketplace" better than "fashion business"
- **Include Numbers**: "Year 1: $1M revenue" better than "grow revenue"
- **Name Competitors**: "Etsy, Faire" better than "other marketplaces"

### ⚠️ If Something Goes Wrong

**Server won't start?**
- Make sure Python 3.8+ is installed
- Check if port 5000 is free
- Try running manually: `python app.py`

**Generation fails?**
- Check all required fields are filled
- Verify internet connection
- Try preview mode first
- Check .env file has API keys

**Need help?**
- See WEB_UI_README.md for detailed guide
- Check the terminal/command window for error messages
- Ask your technical team for API key setup

### 📊 What You Get

After generation, you'll receive:

1. **Markdown File** (.md)
   - Editable plain text version
   - Can be opened in any text editor
   - Easy to modify and customize

2. **PDF Document** (.pdf)
   - Professional, branded PDF
   - Ready for investors/clients
   - Print-ready quality

3. **Pitch Deck** (.pdf) _if selected_
   - Presentation slides
   - Investor-ready format
   - Visual highlights

### 🎯 Quick Generation Checklist

Before clicking "Generate Business Plan":

- [ ] Name and email filled
- [ ] Venture vision is clear and specific
- [ ] Target industry identified
- [ ] Target audience described
- [ ] Unique value proposition written
- [ ] Optional: Added career background
- [ ] Optional: Listed competitors
- [ ] Optional: Described brand personality
- [ ] Optional: Set growth goals
- [ ] Optional: Added milestones
- [ ] Checked "Generate PDF" option
- [ ] Ready to wait 15-20 minutes!

### 📁 Where Are My Files?

Generated files are saved in:
- Your Downloads folder (from web browser)
- `/output/` folder in the project directory

Files are named:
- `business-plan-[your-name].md`
- `business-plan-[your-name].pdf`
- `pitch-deck-[your-name].pdf`

### 🔧 One-Time Setup (Already Done!)

The technical setup is already complete:
- ✅ Python installed
- ✅ Dependencies installed
- ✅ API keys configured in .env
- ✅ Web interface ready

Just run the startup script and you're good to go!

---

**Need more help?** See [WEB_UI_README.md](WEB_UI_README.md) for complete guide

**Technical details?** See main [README.md](README.md)

**Ready?** Run `start_web.sh` or `start_web.bat` and open http://localhost:5000! 🚀
