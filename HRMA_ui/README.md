# HRMS Lite - Frontend

A modern, production-ready React frontend for the HRMS Lite application.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Custom CSS
- **Fonts**: Outfit & Manrope (Google Fonts)

## Features

### Employee Management
- Add new employees with auto-generated IDs
- View all employees in a card grid
- Delete employees
- Email validation
- Empty state handling

### Attendance Management
- Mark attendance (Present/Absent)
- View all attendance records in a table
- Filter by employee
- Attendance summary with statistics
- Real-time date selection

### UI/UX Features
- Clean, professional design
- Responsive layout (mobile-friendly)
- Loading states
- Error handling with user-friendly messages
- Empty states
- Smooth animations and transitions
- Tab-based navigation

## Project Structure

```
HRMA_ui/
├── src/
│   ├── components/
│   │   ├── Employees.jsx      # Employee management UI
│   │   ├── Employees.css
│   │   ├── Attendance.jsx     # Attendance management UI
│   │   └── Attendance.css
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global styles
│   └── main.jsx               # Entry point
├── .env                       # Environment variables
└── package.json
```

## Setup Instructions

### 1. Install dependencies

```bash
cd HRMA_ui
npm install
```

### 2. Configure environment

The `.env` file should contain:

```env
VITE_API_URL=http://localhost:8000
```

Update this URL when deploying to production.

### 3. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### 5. Preview production build

```bash
npm run preview
```

## API Integration

The frontend connects to the FastAPI backend via the API service (`src/services/api.js`).

### Endpoints Used:

**Employees:**
- `GET /api/employees/` - Fetch all employees
- `POST /api/employees/` - Create employee
- `DELETE /api/employees/:id` - Delete employee

**Attendance:**
- `GET /api/attendance/` - Fetch all attendance records
- `GET /api/attendance/employee/:id` - Fetch employee attendance
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/summary` - Fetch attendance summary

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variable in Vercel dashboard:
```
VITE_API_URL=<your-backend-url>
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to Netlify

3. Set environment variable:
```
VITE_API_URL=<your-backend-url>
```

### Important Deployment Notes

- Update `VITE_API_URL` to point to your deployed backend
- The backend must have CORS enabled for the frontend domain
- Make sure the backend is deployed and accessible

## Environment Variables

- `VITE_API_URL` - Backend API URL (required)

## Design Features

- **Typography**: Outfit for headings, Manrope for body text
- **Color Scheme**: Modern blue palette with proper contrast
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and proper form labels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Hot Module Replacement

Vite provides instant HMR for rapid development.

### Linting

```bash
npm run lint
```

## Assumptions & Limitations

- Single admin user (no authentication)
- No pagination (suitable for small-medium datasets)
- Attendance marked once per day per employee
- Delete confirmation uses browser confirm dialog

## Future Enhancements

- Date range filtering for attendance
- Export attendance reports
- Dark mode toggle
- Advanced search and filtering
- Pagination for large datasets

## License

This is an assignment project for evaluation purposes.
