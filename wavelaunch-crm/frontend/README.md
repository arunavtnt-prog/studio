# Wavelaunch CRM - Frontend

Modern React frontend for the Wavelaunch Studio CRM & Client Automation Suite.

## 🏗️ Architecture

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (API URL)
```

## 🚀 Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## 📱 Pages & Features

### Dashboard
- Overview statistics (leads, clients, health scores)
- Quick navigation to key sections
- Real-time metrics

### Leads Page
- View all creator applications
- Filter by stage, search by name/email/niche
- AI-powered analysis with fit scores
- Visual sentiment indicators

### Clients Page
- Grid view of all onboarded clients
- Filter by health status and journey stage
- Quick health score overview
- Direct navigation to client details

### Client Detail Page
- Complete client profile
- Journey progress visualization
- Health score breakdown with component details
- Tabbed interface for:
  - Overview & profile information
  - Milestones tracking
  - Files & documents
  - Email communications
  - Activity timeline

## 🎨 Customization

### Styling

The app uses Tailwind CSS for styling. Customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize your brand colors
      }
    }
  }
}
```

### API Integration

API service is centralized in `src/services/api.js`. All endpoints are abstracted into clean functions:

```javascript
import { clientsAPI } from './services/api';

// Example usage
const clients = await clientsAPI.getAll({ healthStatus: 'Red' });
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/common/Layout.jsx`

## 📚 Component Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── Layout.jsx   # Main app layout with sidebar
│   │   └── HealthBadge.jsx
│   ├── dashboard/       # Dashboard-specific components
│   ├── leads/           # Lead management components
│   └── clients/         # Client management components
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── LeadsPage.jsx
│   ├── ClientsPage.jsx
│   └── ClientDetailPage.jsx
├── services/            # API and service modules
│   └── api.js
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── styles/              # Global styles
    └── index.css
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Proxy Setup

Vite is configured to proxy API requests to the backend during development. See `vite.config.js`.

## 🎯 Health Score Visualization

Health scores are color-coded:

- **Green (80-100)**: Healthy client, represented with green badges
- **Yellow (50-79)**: Needs attention, represented with yellow badges
- **Red (0-49)**: At risk, represented with red badges

## 📊 Data Flow

```
User Action
    ↓
React Component
    ↓
API Service (axios)
    ↓
Backend API
    ↓
Database
    ↓
Response
    ↓
Component State Update
    ↓
UI Re-render
```

## 🚀 Performance Optimizations

- Code splitting with React.lazy (ready to implement)
- Optimized re-renders with React.memo
- Debounced search inputs
- Pagination for large lists (ready to implement)

## 🔒 Authentication

Authentication is ready to implement. The API service has interceptors configured for JWT tokens:

```javascript
// In api.js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Run with coverage
npm test -- --coverage
```

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎨 Icon Usage

Using Heroicons v2:

```javascript
import { UserIcon } from '@heroicons/react/24/outline';

<UserIcon className="h-5 w-5" />
```

## 🔄 State Management

Currently using React's built-in state management (useState, useEffect).

For larger apps, consider:
- Redux Toolkit
- Zustand
- React Query (for server state)

## 📝 Extending the Frontend

### Adding New Filters

1. Add filter state to page component
2. Pass filters to API call
3. Update UI with new filter controls

### Adding New Visualizations

Using Recharts for charts and graphs:

```javascript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data}>
  <Line dataKey="value" />
  <XAxis dataKey="name" />
  <YAxis />
</LineChart>
```

## 🐛 Troubleshooting

### API Connection Issues

- Verify backend is running on port 5000
- Check VITE_API_BASE_URL in .env
- Check browser console for CORS errors

### Build Issues

- Clear node_modules and reinstall
- Check Node.js version (16+ required)
- Clear Vite cache: `rm -rf node_modules/.vite`

### Styling Issues

- Rebuild Tailwind: `npm run dev`
- Check for conflicting CSS
- Verify Tailwind config is correct

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review browser console errors
3. Verify API is accessible
4. Create an issue on GitHub

---

Built with ❤️ for Wavelaunch Studio
