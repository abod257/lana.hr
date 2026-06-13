# HRMS & Employee Self-Service Portal

A complete, production-ready **Human Resource Management System (HRMS)** with **Employee Self-Service (ESS)** capabilities, designed for real-world enterprise deployment.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

## ✨ Features

### 🌍 Internationalization
- **Arabic (RTL)** - Default locale, full right-to-left support
- **English (LTR)** - Complete localization
- Live language switching
- Localized date/time/currency formatting

### 🔐 Authentication & Security
- **JWT Authentication** with refresh tokens
- **Role-Based Access Control (RBAC)** with 6 roles
- **Bcrypt password hashing** (12 rounds)
- **Session management** with PostgreSQL persistence
- **Account lockout** after failed attempts
- **Comprehensive audit logging**
- **HTTP security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **CSRF, XSS, SQL injection protection**
- **2FA support** (TOTP ready)

### 👥 Roles
1. **Employee** - Self-service only
2. **Manager** - Team management
3. **HR Officer** - Employee records
4. **HR Manager** - Full HR access
5. **Payroll Officer** - Payroll processing
6. **System Administrator** - Complete access

### 📊 Modules
- 📈 **Dashboard** - Role-based analytics with charts
- 👥 **Employee Management** - Full CRUD, contracts, transfers, promotions
- ⏰ **Attendance** - Check-in/out, GPS, late tracking
- 🏖️ **Leave Management** - Multiple leave types, approvals, balance tracking
- 💰 **Payroll** - Components, processing, payslips, GOSI
- 🎯 **Recruitment** - Job openings, candidates, interviews, offers
- 📄 **Documents** - Contracts, Iqama, passport tracking with expiry alerts
- 🔔 **Notifications** - In-app, real-time, email/SMS ready
- 📊 **Reports** - Employees, attendance, leave, payroll
- ⚙️ **Settings** - Company info, leave policies, attendance rules

### 🎨 UI/UX
- **Premium enterprise design** with glassmorphism
- **Dark mode / Light mode** with system preference detection
- **Fully responsive** - Mobile, Tablet, Desktop
- **Modern charts** powered by Recharts
- **Animated transitions**
- **Toast notifications** with Sonner
- **Accessible** components

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript 5 |
| Styling | Tailwind CSS, Shadcn-style components |
| Forms | React Hook Form + Zod validation |
| Backend | Next.js API Routes (REST) |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Auth | JWT (jose) + bcrypt |
| Charts | Recharts |
| UI | Lucide Icons, Sonner |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm 10+

### Local Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd hrms-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# 4. Set up the database
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (creates admin user + demo data)
npm run db:seed

# 5. Start development server
npm run dev
```

Visit **http://localhost:3000**

### 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@company.com | Admin@123456 |
| HR Manager | ahmed.mohammed@company.com | Demo@123456 |
| HR Officer | fatima.ali@company.com | Demo@123456 |
| Payroll Officer | khalid.saeed@company.com | Demo@123456 |
| Employee | mohammed.ahmed@company.com | Demo@123456 |

⚠️ **Change default passwords immediately in production!**

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379 (optional)
- **App** on port 3000
- **Nginx** on ports 80/443 (optional)

### Manual Docker Build

```bash
# Build the image
docker build -t hrms-portal .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  --name hrms-app \
  hrms-portal
```

## ▲ Vercel Deployment

### Option 1: One-Click Deploy

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables (see below)
4. Deploy!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Environment Variables

Required environment variables in Vercel:

```
DATABASE_URL              - PostgreSQL connection string
JWT_SECRET                - Min 32 characters
JWT_REFRESH_SECRET        - Min 32 characters
SESSION_SECRET            - Min 32 characters
ENCRYPTION_KEY            - 32-byte hex string
NEXT_PUBLIC_APP_URL       - https://your-domain.com
```

For the database, use **Vercel Postgres**, **Neon**, **Supabase**, or **Railway**.

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Create database
createdb hrms_portal
createuser hrms_user -P

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://hrms_user:password@localhost:5432/hrms_portal"
```

### Option 2: Managed Database (Recommended for Production)

- **Vercel Postgres** - Built-in
- **Neon** - Serverless PostgreSQL
- **Supabase** - PostgreSQL + extras
- **Railway** - Easy deployment
- **AWS RDS** - Enterprise-grade
- **DigitalOcean** - Affordable

## 📜 Environment Variables

Create `.env` from `.env.example`:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_REFRESH_SECRET="generate-with-openssl-rand-base64-32"
SESSION_SECRET="generate-with-openssl-rand-base64-32"

# Encryption
ENCRYPTION_KEY="32-byte-hex-string"

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=app-password

# Uploads
UPLOAD_MAX_SIZE=10485760
```

Generate secure secrets:
```bash
openssl rand -base64 32
```

## 🏗️ Project Structure

```
hrms-portal/
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── seed.ts                # Database seeding
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register, password reset
│   │   ├── (dashboard)/       # All dashboard pages
│   │   └── api/               # Backend API routes
│   ├── components/
│   │   ├── ui/                # shadcn-style UI components
│   │   ├── layout/            # Sidebar, header
│   │   ├── dashboard/         # Dashboard components
│   │   ├── employees/         # Employee components
│   │   ├── leave/             # Leave components
│   │   ├── attendance/        # Attendance components
│   │   ├── payroll/           # Payroll components
│   │   ├── recruitment/       # Recruitment components
│   │   ├── notifications/     # Notifications components
│   │   ├── documents/         # Documents components
│   │   ├── reports/           # Reports components
│   │   ├── settings/          # Settings components
│   │   ├── audit/             # Audit components
│   │   └── profile/           # Profile components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # JWT + RBAC
│   │   ├── audit.ts           # Audit logging
│   │   ├── api-response.ts    # API helpers
│   │   ├── validations.ts     # Zod schemas
│   │   ├── constants.ts       # Roles, permissions
│   │   └── utils.ts           # Utility functions
│   ├── i18n/
│   │   └── index.ts           # Translations
│   └── middleware.ts          # Auth middleware
├── public/
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Current user

### Employees
- `GET /api/employees` - List (with pagination, search, filters)
- `POST /api/employees` - Create
- `GET /api/employees/[id]` - Get one
- `PATCH /api/employees/[id]` - Update
- `DELETE /api/employees/[id]` - Soft delete (terminate)

### Departments & Positions
- `GET/POST /api/departments`
- `GET/POST /api/positions`

### Attendance
- `GET /api/attendance` - List
- `POST /api/attendance` - Manual entry
- `POST /api/attendance/check-in` - Employee check-in
- `POST /api/attendance/check-out` - Employee check-out

### Leave
- `GET /api/leave` - List
- `POST /api/leave` - Submit request
- `POST /api/leave/[id]/approve` - Approve/reject

### Payroll
- `GET /api/payroll` - List payroll runs
- `POST /api/payroll` - Create
- `POST /api/payroll/[id]/process` - Process
- `POST /api/payroll/[id]/approve` - Approve
- `GET /api/payslips` - Get user payslips

### Recruitment
- `GET/POST /api/recruitment/jobs` - Job openings
- `GET/POST /api/recruitment/candidates` - Candidates

### Documents
- `GET/POST /api/documents`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications` - Mark read

### Reports
- `GET /api/reports/employees`
- `GET /api/reports/attendance`
- `GET /api/reports/leave`
- `GET /api/reports/payroll`

### Audit
- `GET /api/audit` - View audit logs

### Settings
- `GET/PUT /api/settings`

### Self-Service
- `POST /api/loan-requests`
- `POST /api/expense-claims`
- `POST /api/overtime-requests`
- `POST /api/salary-certificates`

## 🛡️ Security Best Practices

1. **Always change default passwords and JWT secrets** in production
2. **Use HTTPS** in production (HSTS enabled)
3. **Enable database SSL** in production
4. **Regular backups** of PostgreSQL
5. **Rate limiting** at the reverse proxy level
6. **Monitor audit logs** regularly
7. **Keep dependencies updated** (`npm audit`)
8. **Use environment-specific configs**

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📈 Performance

- Server-side rendering for fast initial loads
- Optimized database queries with Prisma
- Lazy loading for routes
- Image optimization
- Gzip compression
- Static generation where possible

## 🤝 Support

For issues and questions:
- Check the [Documentation](#-api-endpoints)
- Review the [Code Comments](./src)
- Submit an issue on GitHub

## 📄 License

Proprietary - All rights reserved.

---

Built with ❤️ for enterprise HR teams.
