const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calculateLeadScore } = require('../utils/scoring');

const router = express.Router();

// @route   GET /api/leads
// @desc    Get leads with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search, category, city, area, minRating, 
      page = 1, limit = 20, sortBy = 'score', order = 'desc' 
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (category && category !== 'All') query.category = category;
    if (city && city !== 'All') query.city = city;
    if (area) query.area = { $regex: area, $options: 'i' };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Lead.countDocuments(query)
    ]);

    res.json({
      success: true,
      leads,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
});

// @route   GET /api/leads/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const totalLeads = await Lead.countDocuments();

    res.json({
      success: true,
      totalLeads,
      downloads: user.downloads || 0,
      searches: user.downloadsHistory?.length || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// @route   GET /api/leads/recent
// @desc    Get recent leads
// @access  Private
router.get('/recent', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recent leads' });
  }
});

// @route   POST /api/leads/download
// @desc    Download selected leads (deducts credits)
// @access  Private
router.post('/download', protect, async (req, res) => {
  try {
    const { leadIds } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No leads selected' });
    }

    const user = await User.findById(req.user.id);

    if (user.credits < leadIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient credits. You need ${leadIds.length} credits but have ${user.credits}.` 
      });
    }

    // Fetch leads
    const leads = await Lead.find({ _id: { $in: leadIds } }).lean();

    if (leads.length === 0) {
      return res.status(404).json({ success: false, message: 'No leads found' });
    }

    // Deduct credits
    user.credits -= leads.length;
    user.downloads += leads.length;
    user.downloadsHistory.push(...leads.map(l => ({ leadId: l._id })));
    await user.save();

    res.json({
      success: true,
      leads,
      remainingCredits: user.credits,
      downloaded: leads.length
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
});

// @route   POST /api/leads
// @desc    Create new lead (admin or bulk upload)
// @access  Private (Admin only in production)
router.post('/', protect, async (req, res) => {
  try {
    const leadData = req.body;

    // Auto-calculate score
    leadData.score = calculateLeadScore(leadData);

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
});

// @route   POST /api/leads/bulk
// @desc    Bulk create leads
// @access  Private (Admin)
router.post('/bulk', protect, async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'No leads provided' });
    }

    // Calculate scores for all leads
    const leadsWithScores = leads.map(lead => ({
      ...lead,
      score: calculateLeadScore(lead)
    }));

    const created = await Lead.insertMany(leadsWithScores, { ordered: false });

    res.status(201).json({
      success: true,
      count: created.length,
      message: `Successfully created ${created.length} leads`
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create leads' });
  }
});

module.exports = router;