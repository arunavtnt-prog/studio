"""
Flask Web Application for Business Plan Generator
Simple, user-friendly interface for non-technical users.
"""

# CRITICAL: Set Matplotlib backend BEFORE any imports that might use it
# This prevents macOS threading errors when generating charts in Flask
import matplotlib
matplotlib.use('Agg')

import os
import json
import traceback
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, session
from werkzeug.utils import secure_filename
import secrets

# Add project to path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import Settings
from src.orchestrator import BusinessPlanOrchestrator
from src.input_handler import InputHandler, ApplicationData

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'output'

# Ensure directories exist
os.makedirs('uploads', exist_ok=True)
os.makedirs('output', exist_ok=True)
os.makedirs('output/charts', exist_ok=True)

# Initialize orchestrator
settings = Settings()
orchestrator = BusinessPlanOrchestrator(settings)


@app.route('/')
def index():
    """Main page with form."""
    return render_template('index.html')


@app.route('/upload')
def upload_page():
    """File upload page."""
    return render_template('upload.html')


@app.route('/api/validate-environment', methods=['GET'])
def validate_environment():
    """Validate that environment is properly configured."""
    try:
        is_valid = orchestrator.validate_environment()
        return jsonify({
            'success': is_valid,
            'message': 'Environment is properly configured!' if is_valid else 'Environment validation failed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Validation error: {str(e)}'
        }), 500


@app.route('/api/generate', methods=['POST'])
def generate_plan():
    """Generate business plan from form data."""
    try:
        # Get form data
        form_data = request.form.to_dict()

        # Convert to ApplicationData
        input_handler = InputHandler()
        app_data = input_handler.parse_dict(form_data)

        # Validate
        is_valid, missing = input_handler.validate_data(app_data)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': f'Missing required fields: {", ".join(missing)}'
            }), 400

        # Get options
        generate_pdf = request.form.get('generate_pdf', 'true').lower() == 'true'
        generate_pitch = request.form.get('generate_pitch', 'false').lower() == 'true'

        # Save form data to temp file
        creator_name = app_data.full_name or 'creator'
        temp_file = f"uploads/{secure_filename(creator_name)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(temp_file, 'w') as f:
            json.dump(app_data.to_dict(), f, indent=2)

        # Generate business plan
        results = orchestrator.generate_business_plan(
            input_path=temp_file,
            generate_pdf=generate_pdf,
            generate_pitch_deck=generate_pitch,
            verbose=False
        )

        # Get file names
        files = {
            'markdown': os.path.basename(results.get('markdown', '')),
            'pdf': os.path.basename(results.get('pdf', '')) if 'pdf' in results else None,
            'pitch_deck': os.path.basename(results.get('pitch_deck', '')) if 'pitch_deck' in results else None
        }

        # Store in session for download
        session['last_generated'] = files
        session['creator_name'] = creator_name

        return jsonify({
            'success': True,
            'message': 'Business plan generated successfully!',
            'files': files
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Generation failed: {str(e)}'
        }), 500


@app.route('/api/upload-generate', methods=['POST'])
def upload_and_generate():
    """Generate business plan from uploaded file."""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file uploaded'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400

        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Get options
        generate_pdf = request.form.get('generate_pdf', 'true').lower() == 'true'
        generate_pitch = request.form.get('generate_pitch', 'false').lower() == 'true'

        # Generate business plan
        results = orchestrator.generate_business_plan(
            input_path=filepath,
            generate_pdf=generate_pdf,
            generate_pitch_deck=generate_pitch,
            verbose=False
        )

        # Parse to get creator name
        input_handler = InputHandler()
        app_data = input_handler.parse_file(filepath)
        creator_name = app_data.full_name or 'creator'

        # Get file names
        files = {
            'markdown': os.path.basename(results.get('markdown', '')),
            'pdf': os.path.basename(results.get('pdf', '')) if 'pdf' in results else None,
            'pitch_deck': os.path.basename(results.get('pitch_deck', '')) if 'pitch_deck' in results else None
        }

        # Store in session
        session['last_generated'] = files
        session['creator_name'] = creator_name

        return jsonify({
            'success': True,
            'message': 'Business plan generated successfully!',
            'files': files
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Generation failed: {str(e)}'
        }), 500


@app.route('/api/download/<file_type>')
def download_file(file_type):
    """Download generated file."""
    try:
        files = session.get('last_generated', {})

        if file_type not in files or not files[file_type]:
            return jsonify({
                'success': False,
                'message': f'{file_type.title()} file not available'
            }), 404

        filename = files[file_type]
        filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)

        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'message': 'File not found'
            }), 404

        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Download failed: {str(e)}'
        }), 500


@app.route('/api/executive-summary', methods=['POST'])
def generate_summary():
    """Generate only executive summary for preview."""
    try:
        form_data = request.form.to_dict()

        # Convert to ApplicationData
        input_handler = InputHandler()
        app_data = input_handler.parse_dict(form_data)

        # Save temp file
        creator_name = app_data.full_name or 'creator'
        temp_file = f"uploads/{secure_filename(creator_name)}_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(temp_file, 'w') as f:
            json.dump(app_data.to_dict(), f, indent=2)

        # Generate summary
        results = orchestrator.generate_executive_summary_only(
            input_path=temp_file,
            verbose=False
        )

        # Read summary content
        summary_file = results.get('executive_summary')
        with open(summary_file, 'r') as f:
            summary_content = f.read()

        return jsonify({
            'success': True,
            'summary': summary_content
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Summary generation failed: {str(e)}'
        }), 500


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("BUSINESS PLAN GENERATOR - WEB INTERFACE")
    print("="*60)
    print("\n🚀 Starting server...")
    print(f"\n📍 Open your browser and go to:")
    print(f"\n   http://localhost:5000")
    print(f"\n⚠️  Press Ctrl+C to stop the server\n")
    print("="*60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
