# RVCE Placement Hub

A complete, responsive web application for **RVCE (Rashtreeya Vidyalaya College of Engineering)** B.E. students to track upcoming campus placement companies, registration deadlines, online assessments, pre-placement talks (PPT), and interviews.

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React Icons
- **Backend / API**: Vercel Serverless Functions (`/api/*`)
- **Database**: MongoDB Atlas (`rvce-placement` database)
- **Security**: HTTP-only session cookies, bcrypt password hashing
- **Deployment**: Vercel

---

## MongoDB Atlas Setup Guide

### 1. Create MongoDB Atlas Cluster & Database
1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster (Free Shared M0 or Serverless).
3. Under **Database**, click **Connect** and copy your Node.js Connection String:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/rvce-placement?retryWrites=true&w=majority
   ```
4. Under **Database Deployments > Browse Collections**, create a database named:
   ```text
   rvce-placement
   ```
   with collections:
   - `companies`
   - `events`
   - `admins`

### 2. Network Access Configuration (for Vercel)
1. Go to **Network Access** in the MongoDB Atlas sidebar.
2. Click **Add IP Address**.
3. Select **Allow Access From Anywhere (`0.0.0.0/0`)** so Vercel Serverless Functions can connect to MongoDB.

---

## Admin Password Hash Generation

Generate a secure `bcrypt` hash for your admin password using Node.js:

```bash
node -e "console.log(require('bcryptjs').hashSync('your_secure_password', 10))"
```

Output example:
```text
$2a$10$w8T0J4b9/Kk... (Copy this hash into ADMIN_PASSWORD_HASH)
```

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set environment variables in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/rvce-placement?retryWrites=true&w=majority
ADMIN_EMAIL=admin@rvce.edu.in
ADMIN_PASSWORD_HASH=$2a$10$YourGeneratedBcryptHashHere
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build & Production Verification

Verify TypeScript compilation and static build assets:

```bash
npm run build
```

---

## Vercel Deployment

1. Deploy using Vercel CLI or link your GitHub repository on Vercel:
   ```bash
   npx vercel
   ```
2. Go to **Vercel Dashboard > Project Settings > Environment Variables**.
3. Add the following server-side environment variables:
   - `MONGODB_URI`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
4. Redeploy to activate MongoDB Atlas database sync!
