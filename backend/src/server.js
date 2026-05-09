const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://leads.creativeinteriorz.in',
    'https://leads.creativeinteriorz.in',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);

// Temporary seed route
app.get('/api/seed', async (req, res) => {
  try {
    const Lead = require('./models/Lead');
    await Lead.deleteMany({});
    
    const sampleLeads = [
      { name: "Taj Mahal Palace Hotel", category: "Hotel", city: "Mumbai", area: "Colaba", phone: "+91 22 6665 3366", email: "reservations@tajmahalpalace.com", website: "https://www.tajhotels.com", rating: 4.8, score: 95, address: "Apollo Bunder, Colaba, Mumbai", verified: true, source: "manual" },
      { name: "Leela Palace Bangalore", category: "Hotel", city: "Bangalore", area: "Old Airport Road", phone: "+91 80 2521 1234", email: "bangalore@theleela.com", website: "https://www.theleela.com", rating: 4.7, score: 92, address: "23, Old Airport Road, Bangalore", verified: true, source: "manual" },
      { name: "Apollo Hospitals", category: "Hospital", city: "Chennai", area: "Greams Road", phone: "+91 44 2829 0200", email: "info@apollohospitals.com", website: "https://www.apollohospitals.com", rating: 4.6, score: 90, address: "21, Greams Lane, Chennai", verified: true, source: "manual" },
      { name: "Infosys Ltd", category: "IT Services", city: "Bangalore", area: "Electronic City", phone: "+91 80 2852 0261", email: "contact@infosys.com", website: "https://www.infosys.com", rating: 4.5, score: 88, address: "Electronics City, Bangalore", verified: true, source: "manual" },
      { name: "Biryani By Kilo", category: "Restaurant", city: "Delhi", area: "Connaught Place", phone: "+91 11 4717 0000", email: "care@biryanibykilo.com", website: "https://www.biryanibykilo.com", rating: 4.3, score: 82, address: "N-17, Connaught Place, Delhi", verified: true, source: "manual" },
      { name: "Prestige Group", category: "Real Estate", city: "Bangalore", area: "MG Road", phone: "+91 80 2559 1000", email: "info@prestigegroup.com", website: "https://www.prestigegroup.com", rating: 4.4, score: 85, address: "MG Road, Bangalore", verified: true, source: "manual" },
      { name: "Delhi Public School", category: "School", city: "Delhi", area: "R.K. Puram", phone: "+91 11 2617 1271", email: "info@dpsrkp.net", website: "https://www.dpsrkp.net", rating: 4.6, score: 91, address: "Sector XII, R.K. Puram, Delhi", verified: true, source: "manual" },
      { name: "Wipro Technologies", category: "IT Services", city: "Bangalore", area: "Sarjapur Road", phone: "+91 80 2844 0011", email: "investors@wipro.com", website: "https://www.wipro.com", rating: 4.2, score: 80, address: "Sarjapur Road, Bangalore", verified: true, source: "manual" },
      { name: "Oberoi Hotels", category: "Hotel", city: "Mumbai", area: "Nariman Point", phone: "+91 22 6632 5757", email: "reservations@oberoihotels.com", website: "https://www.oberoihotels.com", rating: 4.9, score: 96, address: "Nariman Point, Mumbai", verified: true, source: "manual" },
      { name: "Max Super Speciality Hospital", category: "Hospital", city: "Delhi", area: "Saket", phone: "+91 11 2651 5050", email: "info@maxhealthcare.com", website: "https://www.maxhealthcare.in", rating: 4.5, score: 89, address: "Saket, Delhi", verified: true, source: "manual" }
    ];
    
    await Lead.insertMany(sampleLeads);
    res.json({ success: true, message: `${sampleLeads.length} leads seeded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;