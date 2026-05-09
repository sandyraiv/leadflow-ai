require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('./models/Lead');

const sampleLeads = [
  {
    name: "Taj Mahal Palace Hotel",
    category: "Hotel",
    city: "Mumbai",
    area: "Colaba",
    phone: "+91 22 6665 3366",
    email: "reservations@tajmahalpalace.com",
    website: "https://www.tajhotels.com",
    rating: 4.8,
    score: 95,
    address: "Apollo Bunder, Colaba, Mumbai, Maharashtra 400001",
    verified: true,
    source: "manual"
  },
  {
    name: "Leela Palace Bangalore",
    category: "Hotel",
    city: "Bangalore",
    area: "Old Airport Road",
    phone: "+91 80 2521 1234",
    email: "bangalore@theleela.com",
    website: "https://www.theleela.com",
    rating: 4.7,
    score: 92,
    address: "23, Old Airport Road, Bangalore, Karnataka 560008",
    verified: true,
    source: "manual"
  },
  {
    name: "Apollo Hospitals",
    category: "Hospital",
    city: "Chennai",
    area: "Greams Road",
    phone: "+91 44 2829 0200",
    email: "info@apollohospitals.com",
    website: "https://www.apollohospitals.com",
    rating: 4.6,
    score: 90,
    address: "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
    verified: true,
    source: "manual"
  },
  {
    name: "Infosys Ltd",
    category: "IT Services",
    city: "Bangalore",
    area: "Electronic City",
    phone: "+91 80 2852 0261",
    email: "contact@infosys.com",
    website: "https://www.infosys.com",
    rating: 4.5,
    score: 88,
    address: "Electronics City, Hosur Road, Bangalore, Karnataka 560100",
    verified: true,
    source: "manual"
  },
  {
    name: "Biryani By Kilo",
    category: "Restaurant",
    city: "Delhi",
    area: "Connaught Place",
    phone: "+91 11 4717 0000",
    email: "care@biryanibykilo.com",
    website: "https://www.biryanibykilo.com",
    rating: 4.3,
    score: 82,
    address: "N-17, Outer Circle, Connaught Place, New Delhi 110001",
    verified: true,
    source: "manual"
  },
  {
    name: "Prestige Group",
    category: "Real Estate",
    city: "Bangalore",
    area: "MG Road",
    phone: "+91 80 2559 1000",
    email: "info@prestigegroup.com",
    website: "https://www.prestigegroup.com",
    rating: 4.4,
    score: 85,
    address: "The Falcon House, MG Road, Bangalore, Karnataka 560001",
    verified: true,
    source: "manual"
  },
  {
    name: "Delhi Public School",
    category: "School",
    city: "Delhi",
    area: "R.K. Puram",
    phone: "+91 11 2617 1271",
    email: "info@dpsrkp.net",
    website: "https://www.dpsrkp.net",
    rating: 4.6,
    score: 91,
    address: "Sector XII, R.K. Puram, New Delhi 110022",
    verified: true,
    source: "manual"
  },
  {
    name: "Wipro Technologies",
    category: "IT Services",
    city: "Bangalore",
    area: "Sarjapur Road",
    phone: "+91 80 2844 0011",
    email: "investors@wipro.com",
    website: "https://www.wipro.com",
    rating: 4.2,
    score: 80,
    address: "Doddakannelli, Sarjapur Road, Bangalore, Karnataka 560035",
    verified: true,
    source: "manual"
  },
  {
    name: "Oberoi Hotels & Resorts",
    category: "Hotel",
    city: "Mumbai",
    area: "Nariman Point",
    phone: "+91 22 6632 5757",
    email: "reservations@oberoihotels.com",
    website: "https://www.oberoihotels.com",
    rating: 4.9,
    score: 96,
    address: "Nariman Point, Mumbai, Maharashtra 400021",
    verified: true,
    source: "manual"
  },
  {
    name: "Max Super Speciality Hospital",
    category: "Hospital",
    city: "Delhi",
    area: "Saket",
    phone: "+91 11 2651 5050",
    email: "info@maxhealthcare.com",
    website: "https://www.maxhealthcare.in",
    rating: 4.5,
    score: 89,
    address: "1, Press Enclave Road, Saket, New Delhi 110017",
    verified: true,
    source: "manual"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Lead.deleteMany({});
    console.log('🗑️  Old leads cleared');

    await Lead.insertMany(sampleLeads);
    console.log(`✅ ${sampleLeads.length} sample leads added`);

    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
