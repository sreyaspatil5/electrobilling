# ElectroBill — Electrical Parts Billing App

A full-stack professional billing web application for electrical parts resellers.

**Stack:** React + MUI · Node.js/Express · MongoDB Atlas · Amazon S3 · JWT Auth · Puppeteer PDF

---

## Quick Start

### Step 1 — Fill in Environment Variables

**`server/.env.development`** — replace ALL placeholder values:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@yourcluster.mongodb.net/billing_db
JWT_SECRET=any_long_random_string_here
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket
S3_BASE_URL=https://your-bucket.s3.ap-south-1.amazonaws.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Step 2 — Register Admin Account (one time only)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@yourbiz.com","password":"yourpassword"}'
```

Or use Postman / Thunder Client.

### Step 3 — Start Backend

```bash
cd server
npm run dev
```

### Step 4 — Start Frontend

```bash
cd client
npm run dev
```

Open **http://localhost:5173** → Login → Done!

---

## AWS S3 Setup (Required)

1. Create an S3 bucket (e.g. `my-electrobill-bucket`)
2. Enable **public access** or set bucket policy for invoice PDFs
3. Add **CORS policy** to the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

4. Create an IAM user with `AmazonS3FullAccess` (or scoped to your bucket)
5. Copy the Access Key ID and Secret into your `.env.development`

---

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create free cluster
2. Add a database user (username + password)
3. Allow IP: `0.0.0.0/0` (all) in Network Access
4. Copy connection string → paste into `MONGODB_URI`

---

## Gmail Setup (Nodemailer)

1. Enable 2FA on your Google account
2. Go to **Security → App Passwords**
3. Generate a password for "Mail"
4. Use that 16-char password as `EMAIL_PASS`

---

## Project Structure

```
billing/
├── client/                 # React + Vite + MUI
│   └── src/
│       ├── pages/          # Dashboard, CreateBill, Customers, Products, Invoices, Reports, Settings
│       ├── components/     # Layout (Sidebar, TopBar), common (StatCard, ConfirmDialog...)
│       ├── context/        # AuthContext (JWT), BusinessContext
│       ├── services/       # Axios API client
│       └── utils/          # formatters, calcInvoiceTotals, constants
│
└── server/                 # Node.js + Express
    ├── controllers/        # auth, business, customers, products, invoices, upload, email
    ├── routes/             # REST API routes with express-validator
    ├── models/             # Counter, User, Business, Customer, Product, Invoice
    ├── middleware/         # auth (JWT), errorHandler, validate, requestLogger
    ├── services/           # pdfService (Puppeteer), s3Service, emailService
    └── config/             # db, s3, logger (Winston)
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create admin account (one-time) |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET/PUT | `/api/business` | ✅ | Business profile |
| GET/POST/PUT/DELETE | `/api/customers` | ✅ | Customer CRUD |
| GET/POST/PUT/DELETE | `/api/products` | ✅ | Product CRUD |
| GET/POST | `/api/invoices` | ✅ | List/create invoices |
| DELETE | `/api/invoices/:id` | ✅ | Soft delete invoice |
| GET | `/api/invoices/stats` | ✅ | Dashboard stats |
| GET | `/api/invoices/reports` | ✅ | Chart data |
| POST | `/api/upload/presign` | ✅ | Get S3 pre-signed URL |
| POST | `/api/email/send` | ✅ | Email invoice PDF |

---

## Key Features

| Feature | Implementation |
|---------|---------------|
| PDF Generation | Puppeteer (backend, server-side, consistent) |
| File Storage | Amazon S3 (pre-signed PUT URLs for logo/signature) |
| Invoice Numbers | Atomic MongoDB counter (no race conditions) |
| Authentication | JWT Bearer token, 7-day expiry |
| Soft Delete | `status: "active" / "deleted"` on Invoice model |
| Logging | Winston + daily rotating log files (`server/logs/`) |
| GST | CGST+SGST or IGST toggle per invoice |
| Stock Tracking | Auto-decremented on invoice creation |

---

## Production Deployment

1. Set `NODE_ENV=production` and fill `.env.production`
2. Build frontend: `cd client && npm run build`
3. Serve `client/dist` via Nginx or similar
4. Run server with PM2: `pm2 start server.js --name electrobill`
