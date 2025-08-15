# IELTS Preparation Web Application

A full-stack web application for IELTS preparation with a focus on the Reading section, built with React.js frontend and Django backend.

## Features

### Frontend (React.js + Tailwind CSS)
- **IELTS Reading Interface**: Authentic exam-like interface with 60-minute timer
- **Question Types**: 
  - Matching questions
  - True/False/Not Given (Radio buttons)
  - Fill in the blanks
  - Short answer questions
- **Navigation**: Next/previous questions, jump to any question
- **Responsive Design**: Works on desktop and mobile devices

### Backend (Django + Django REST Framework)
- **User Authentication**: JWT-based authentication system
- **AI Integration**: OpenAI API for generating reading passages and questions
- **Database Management**: Store users, tests, questions, and results
- **Admin Dashboard**: Manage content and view analytics

### Question Types Supported
1. **Matching**: Dropdown selections
2. **True/False/Not Given**: Radio button options
3. **Fill in the Blanks**: Text input fields
4. **Short Answer**: Text input fields

## Project Structure

```
IELTS-Django/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
├── backend/                 # Django application
│   ├── ielts_app/          # Main Django app
│   ├── api/                # API endpoints
│   ├── users/              # User management
│   └── tests/              # Test management
├── requirements.txt         # Python dependencies
└── package.json            # Node.js dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- OpenAI API key

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh JWT token

### Tests
- `GET /api/tests/` - List all tests
- `POST /api/tests/` - Create new test (admin only)
- `GET /api/tests/{id}/` - Get test details
- `POST /api/tests/{id}/submit/` - Submit test answers

### Results
- `GET /api/results/` - User's test results
- `GET /api/results/{id}/` - Specific result details

## Database Schema

### Users
- id, username, email, password, date_joined

### ReadingTests
- id, title, passage, created_at, is_active

### Questions
- id, test_id, question_text, question_type, choices, correct_answer, order

### TestResults
- id, user_id, test_id, score, answers, completed_at

## Deployment

### Backend (Django)
- Use Django's production settings
- Set up PostgreSQL database
- Configure static files serving
- Set up environment variables

### Frontend (React)
- Build production version: `npm run build`
- Serve with nginx or similar web server
- Configure API endpoint URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 