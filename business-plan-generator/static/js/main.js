// Business Plan Generator - Main JavaScript

// Check environment on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/validate-environment');
        const result = await response.json();

        if (!result.success) {
            console.warn('Environment validation failed:', result.message);
        }
    } catch (error) {
        console.error('Failed to validate environment:', error);
    }
});

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // You can implement a toast notification system here
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Auto-save form data to localStorage (optional)
function enableAutoSave(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Load saved data
    const savedData = localStorage.getItem(`${formId}_autosave`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && input.type !== 'file') {
                    if (input.type === 'checkbox') {
                        input.checked = data[key];
                    } else {
                        input.value = data[key];
                    }
                }
            });
        } catch (e) {
            console.error('Failed to load autosave data:', e);
        }
    }

    // Save on input change
    form.addEventListener('input', () => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (key !== 'file') { // Don't save file inputs
                data[key] = value;
            }
        }
        localStorage.setItem(`${formId}_autosave`, JSON.stringify(data));
    });
}

// Enable autosave for the main form
if (document.getElementById('businessPlanForm')) {
    enableAutoSave('businessPlanForm');
}

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalid = null;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--accent-color)';
            isValid = false;
            if (!firstInvalid) {
                firstInvalid = field;
            }
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid && firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
    }

    return isValid;
}

// Export functions for use in templates
window.showNotification = showNotification;
window.validateForm = validateForm;
