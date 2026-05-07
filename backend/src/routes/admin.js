const express = require('express');
const User = require('../models/User');
const Lead = require('../models/Lead');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalLeads, totalDownloads] = await Promise.all([
      User.countDocuments(),
      Lead.countDocuments(),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }])
    ]);

    // Get category distribution
    const categoryDistribution = await Lead.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const totalLeadCount = totalLeads || 1;
    const formattedDistribution = categoryDistribution.map(cat => ({
      name: cat._id,
      count: cat.count,
      percentage: Math.round((cat.count / totalLeadCount) * 100)
    }));

    // Mock revenue calculation (replace with actual payment data)
    const totalRevenue = totalDownloads[0]?.total * 4 || 0; // Approx ₹4 per lead

    res.json({
      success: true,
      totalUsers,
      totalLeads,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalRevenue,
      categoryDistribution: formattedDistribution,
      recentActivity: [
        { action: 'New user registered', user: 'john@example.com', time: '2 min ago' },
        { action: 'Leads downloaded', user: 'sarah@company.com', time: '15 min ago' },
        { action: 'Credits purchased', user: 'mike@agency.com', time: '1 hour ago' }
      ]
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// @route   GET /api/admin/leads
// @desc    Get all leads with pagination
// @access  Admin
router.get('/leads', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Lead.countDocuments()
    ]);

    res.json({
      success: true,
      leads,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
});

// @route   POST /api/admin/add-credits
// @desc    Add credits to user
// @access  Admin
router.post('/add-credits', async (req, res) => {
  try {
    const { userId, credits } = req.body;

    if (!userId || !credits || credits < 1) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.credits += parseInt(credits);
    await user.save();

    res.json({
      success: true,
      message: `Added ${credits} credits to ${user.name}`,
      newBalance: user.credits
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add credits' });
  }
});

// @route   PATCH /api/admin/leads/:id
// @desc    Update lead (verify/unverify)
// @access  Admin
router.patch('/leads/:id', async (req, res) => {
  try {
    const { verified } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
});

// @route   DELETE /api/admin/leads/:id
// @desc    Delete lead
// @access  Admin
router.delete('/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
});

module.exports = router;