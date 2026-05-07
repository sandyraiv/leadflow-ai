# 🎯 LeadFlow AI - AI Lead Generator SaaS

A complete, production-ready AI-powered lead generation platform built for agencies, marketers, and sales teams.

## ✨ Features

- 🔍 **Smart Search** - Find leads by city, area, and business category
- 📊 **AI Lead Scoring** - Automatic quality scoring (0-100) based on data completeness
- 💳 **Credit System** - Pay-per-lead model with no subscriptions
- 📥 **Export** - Download leads as CSV/Excel
- 🔐 **User Authentication** - JWT-based secure auth
- 👑 **Admin Panel** - Manage users, leads, and credits
- 🤖 **Scraper Tools** - Python scripts to populate your database
- 📱 **Responsive Design** - Works on all devices

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Free Tier) |
| Hosting | Vercel (Frontend) + Render (Backend) |
| Scraper | Python + BeautifulSoup |

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <your-repo>
cd ai-lead-generator-saas
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL
npm install
npm start
```

### 4. Scraper Setup
```bash
cd scraper
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python bulk_upload.py --file sample_leads.csv --city "Mumbai" --category "Restaurant"
```

## 📁 Project Structure

```
ai-lead-generator-saas/
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   └── utils/         # Helper functions
│   └── public/
├── backend/               # Node.js API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Mongoose models
│   │   ├── middleware/    # Auth & validation
│   │   └── utils/         # Scoring algorithm
│   └── src/config/        # Database config
├── scraper/               # Python scrapers
│   ├── google_maps_scraper.py
│   ├── bulk_upload.py
│   └── sample_leads.csv
└── docs/                  # Documentation
    ├── DEPLOYMENT_GUIDE.md
    └── README.md
```

## 💰 Pricing Plans

| Plan | Credits | Price |
|------|---------|-------|
| Starter | 100 | ₹499 |
| Professional | 500 | ₹1,999 |
| Agency | 1,000 | ₹3,499 |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Leads
- `GET /api/leads` - Search leads with filters
- `POST /api/leads/download` - Download leads (deducts credits)
- `GET /api/leads/stats` - Get dashboard stats
- `GET /api/leads/recent` - Get recent leads

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/add-credits` - Add credits to user
- `PATCH /api/admin/leads/:id` - Verify/unverify lead

## 🛡️ Security

- Password hashing with bcrypt (12 rounds)
- JWT authentication with 30-day expiry
- Helmet.js for security headers
- CORS protection
- Input validation with express-validator
- MongoDB injection protection via Mongoose

## 📝 License

MIT License - feel free to use for commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For questions or support, email: support@leadflowai.com

---

Built with ❤️ for bootstrapped founders.
