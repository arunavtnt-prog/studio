# Matplotlib Threading & macOS Fix

## Problem

When running the business plan generator on macOS (especially in Flask web context), Matplotlib would crash with:

```
NSWindow should only be instantiated on the main thread!
UserWarning: Starting a Matplotlib GUI outside of the main thread will likely fail.
```

## Root Cause

By default, Matplotlib tries to use an interactive GUI backend (like TkAgg or MacOSX) which requires:
1. Running on the main thread (not in Flask worker threads)
2. GUI window display capability (not available in headless/web contexts)

## Solution

Force Matplotlib to use the **Agg (Anti-Grain Geometry)** non-interactive backend, which:
- ✅ Generates image files directly (PNG, PDF, etc.)
- ✅ Works in any thread (thread-safe)
- ✅ No GUI windows required
- ✅ Perfect for web/batch contexts
- ✅ Works headless (servers, containers)

## Implementation

### Critical Rule

**Set the backend BEFORE importing `matplotlib.pyplot` or any plotting functions.**

```python
# CORRECT - Backend set FIRST
import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt  # Now safe
```

```python
# WRONG - Too late!
import matplotlib.pyplot as plt  # Uses default backend
matplotlib.use('Agg')  # This won't work!
```

### Files Updated

#### 1. `src/visualizer.py` (Primary Fix)

```python
"""
Data visualization module for business plan charts and graphs.

IMPORTANT: This module uses the Agg (non-GUI) backend for Matplotlib to avoid
threading issues on macOS and enable headless operation in web/batch contexts.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Tuple

# CRITICAL: Set non-GUI backend BEFORE importing pyplot
# This prevents "NSWindow should only be instantiated on the main thread!" errors on macOS
# and allows charts to be generated in Flask/threading contexts
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
# ... rest of imports
```

#### 2. `app.py` (Flask Web App)

```python
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
# ... rest of imports
```

#### 3. `main.py` (CLI Application)

```python
#!/usr/bin/env python3
"""
Business Plan Generator - Main CLI Application
"""

# CRITICAL: Set Matplotlib backend BEFORE any imports
# Ensures charts are generated as files, not GUI windows
import matplotlib
matplotlib.use('Agg')

import argparse
import sys
# ... rest of imports
```

## Best Practices

### For Web Applications (Flask, Django, etc.)

1. **Set backend at app entry point**
   ```python
   # At the very top of app.py, before any other imports
   import matplotlib
   matplotlib.use('Agg')
   ```

2. **Never use `plt.show()`**
   - Always use `plt.savefig()` instead
   - Close figures after saving: `plt.close()`

3. **Use context managers for thread safety**
   ```python
   import matplotlib.pyplot as plt

   def generate_chart():
       fig, ax = plt.subplots()
       # ... create chart
       filepath = 'output/chart.png'
       plt.savefig(filepath, dpi=300, bbox_inches='tight')
       plt.close(fig)  # Clean up
       return filepath
   ```

### For CLI Applications

1. **Set backend early**
   ```python
   # Before importing any modules that might use matplotlib
   import matplotlib
   matplotlib.use('Agg')
   ```

2. **Explicit figure management**
   ```python
   # Good practice: explicitly close figures
   fig, ax = plt.subplots()
   # ... plotting code
   plt.savefig('chart.png')
   plt.close(fig)
   ```

### For Library/Module Code

1. **Set backend in the module itself**
   ```python
   # At top of your visualization module
   import matplotlib
   matplotlib.use('Agg')
   import matplotlib.pyplot as plt
   ```

2. **Document the backend requirement**
   ```python
   """
   Module description.

   IMPORTANT: Uses Matplotlib Agg backend for thread-safe,
   headless chart generation.
   """
   ```

## Available Matplotlib Backends

### Non-GUI (Recommended for our use case)

- **Agg** - Anti-Grain Geometry (PNG, RGBA)
  - ✅ Thread-safe
  - ✅ No dependencies
  - ✅ High-quality output
  - **Use this for web/batch/headless contexts**

- **Cairo** - Cairo graphics (PNG, PDF, PS, SVG)
  - Requires Cairo library
  - Vector graphics support

- **PDF** - PDF backend (PDF only)
- **PS** - PostScript backend (PS, EPS)
- **SVG** - SVG backend (SVG only)

### GUI (NOT recommended for our use case)

- **TkAgg** - Tk/Tcl (default on many systems)
  - ❌ Requires main thread
  - ❌ Needs display

- **MacOSX** - Native macOS (default on Mac)
  - ❌ Main thread only
  - ❌ Causes the crashes we're fixing

- **Qt5Agg** - Qt5
- **WXAgg** - wxWidgets
- **GTK3Agg** - GTK3

## Verifying the Backend

Check which backend is being used:

```python
import matplotlib
print(matplotlib.get_backend())  # Should print: 'agg'
```

In Python shell:
```bash
python3 -c "import matplotlib; print(matplotlib.get_backend())"
```

## Testing the Fix

### Test 1: CLI Generation

```bash
cd business-plan-generator
python main.py sample_data/sample_input.json --no-pdf
```

Should complete without GUI errors and create charts in `output/charts/`

### Test 2: Web Application

```bash
./start_web.sh
# Open http://localhost:5000
# Fill form and generate
```

Should work without threading errors.

### Test 3: Verify Charts

```bash
ls -lh output/charts/
```

Should see PNG files:
- `creator_market_sizing.png`
- `creator_audience_demographics.png`
- `creator_competitive_matrix.png`
- etc.

## Common Pitfalls

### ❌ Setting Backend Too Late

```python
import matplotlib.pyplot as plt  # WRONG - Backend already set!
matplotlib.use('Agg')  # Too late
```

### ❌ Using plt.show()

```python
plt.plot([1, 2, 3])
plt.show()  # WRONG - Tries to open GUI window
```

### ✅ Correct Pattern

```python
import matplotlib
matplotlib.use('Agg')  # FIRST

import matplotlib.pyplot as plt

plt.plot([1, 2, 3])
plt.savefig('chart.png')  # CORRECT
plt.close()
```

## Environment Variables (Alternative)

You can also set the backend via environment variable:

```bash
export MPLBACKEND=Agg
python main.py input.json
```

But hardcoding in code is more reliable for distributed applications.

## Thread Safety Notes

Even with Agg backend:

1. **Create separate figures per thread**
   ```python
   # Each chart function creates its own figure
   fig, ax = plt.subplots()  # New figure
   # ... plot
   plt.close(fig)  # Clean up
   ```

2. **Close figures after saving**
   ```python
   plt.savefig('chart.png')
   plt.close()  # Prevents memory leaks
   ```

3. **Avoid global pyplot state in threads**
   ```python
   # Good - explicit figure
   fig, ax = plt.subplots()
   ax.plot(data)

   # Less good - global state
   plt.plot(data)  # Uses current figure
   ```

## Performance Tips

1. **Set DPI appropriately**
   ```python
   plt.savefig('chart.png', dpi=300)  # High quality
   ```

2. **Use bbox_inches='tight'**
   ```python
   plt.savefig('chart.png', bbox_inches='tight')  # No whitespace
   ```

3. **Set rcParams once**
   ```python
   plt.rcParams.update(branding.get_matplotlib_config())
   # Then create multiple charts
   ```

## Debugging

If you still get threading errors:

1. **Check import order**
   ```bash
   grep -n "import matplotlib" *.py
   grep -n "matplotlib.use" *.py
   ```

2. **Verify backend**
   ```python
   import matplotlib
   print(f"Backend: {matplotlib.get_backend()}")
   ```

3. **Check for plt.show() calls**
   ```bash
   grep -r "plt.show()" .
   ```

4. **Enable matplotlib logging**
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   import matplotlib
   matplotlib.set_loglevel('debug')
   ```

## Summary

✅ **What We Fixed:**
- Set `matplotlib.use('Agg')` at the top of all entry points
- Ensured backend is set BEFORE pyplot imports
- No GUI windows, only file output
- Thread-safe visualization generation

✅ **Where We Fixed:**
- `src/visualizer.py` - Primary visualization module
- `app.py` - Flask web application
- `main.py` - CLI application

✅ **Result:**
- Charts generate successfully on macOS
- Works in Flask threading context
- No "NSWindow" errors
- Headless/server-ready
- All platforms supported

---

**Reference:**
- [Matplotlib Backends Documentation](https://matplotlib.org/stable/users/explain/backends.html)
- [What is a backend?](https://matplotlib.org/stable/users/explain/backends.html#what-is-a-backend)
- [Agg Backend](https://matplotlib.org/stable/api/backend_agg_api.html)
