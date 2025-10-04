# ExpenseFlow

A modern expense management web application with role-based access control, real-time currency conversion, and automated approval workflows.

## Features

- **Multi-tenant Architecture**: Company-based data isolation
- **Role-based Access Control**: Admin, Manager, and Employee roles
- **Real-time Currency Conversion**: Automatic conversion using ExchangeRate API
- **Approval Workflows**: Sequential approval with percentage rules
- **Email Integration**: Password reset and user credential emails via EmailJS
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- EmailJS for email services

**Backend:**
- Node.js with Express
- PostgreSQL (Neon cloud database)
- JWT authentication
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- EmailJS account for email services

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ExpenseFlow
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**

Create `backend/.env`:
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
COMPANY_BASE_CURRENCY=USD
```

5. **Database Migration**
```bash
cd backend
# Run migrations in order
psql $DATABASE_URL -f database/migrations/001_initial.sql
psql $DATABASE_URL -f database/migrations/002_add_country.sql
psql $DATABASE_URL -f database/migrations/003_company_structure.sql
psql $DATABASE_URL -f database/migrations/004_approval_workflow.sql
psql $DATABASE_URL -f database/migrations/005_add_paid_by.sql
psql $DATABASE_URL -f database/migrations/006_add_otp_columns.sql
```

6. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Usage

### Admin Features
- Create and manage users
- Set up approval rules and workflows
- View all company expenses
- Send user credentials via email

### Manager Features
- Approve/reject expenses from assigned employees
- View team expense reports
- Access approval dashboard

### Employee Features
- Submit expense reports with currency conversion
- Track expense status (To Submit, Waiting Approval, Approved)
- View expense history and amounts

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Company admin signup
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/forgot-password` - Generate OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP and reset password

### Expenses
- `GET /api/expenses` - Get expenses (role-based)
- `POST /api/expenses` - Create expense with currency conversion
- `GET /api/approvals` - Get pending approvals
- `POST /api/approvals/:id` - Process approval

### User Management (Admin only)
- `GET /api/users` - Get all company users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user role/manager
- `POST /api/users/:id/send-password` - Generate and send password

### Approval Rules (Admin only)
- `GET /api/approval-rules` - Get approval rules
- `POST /api/approval-rules` - Create approval rule

## Database Schema

### Key Tables
- `companies` - Multi-tenant company data
- `users` - User accounts with roles and manager relationships
- `expenses` - Expense records with currency conversion
- `approval_rules` - Configurable approval workflows
- `expense_approvals` - Approval workflow tracking

## Configuration

### EmailJS Setup
Update `frontend/src/config/emailjs.js` with your EmailJS credentials:
```javascript
export const EMAILJS_CONFIG = {
  serviceId: 'your_service_id',
  templates: {
    password: 'your_password_template_id',
    otp: 'your_otp_template_id'
  },
  publicKey: 'your_public_key'
};
```

### Currency API
The app uses ExchangeRate API for real-time conversion. Update the API key in `backend/server.js` if needed.

## Deployment

### Frontend (Vite)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend (Node.js)
```bash
cd backend
npm start
# Deploy to your Node.js hosting service
```

## Project Structure

```
ExpenseFlow/
├── backend/
│   ├── database/
│   │   └── migrations/     # Database migration files
│   ├── middleware/         # Authentication middleware
│   ├── services/          # Business logic services
│   └── server.js          # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── config/        # Configuration files
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details