/**
 * AI Lead Scoring Algorithm
 * Calculates a score (0-100) based on data completeness and quality
 */
function calculateLeadScore(lead) {
  let score = 0;

  // Base score for having a name
  score += 10;

  // Contact information (max 40 points)
  if (lead.phone && lead.phone.length > 5) score += 15;
  if (lead.email && lead.email.includes('@')) score += 15;
  if (lead.website && lead.website.includes('.')) score += 10;

  // Location data (max 20 points)
  if (lead.city) score += 10;
  if (lead.area) score += 5;
  if (lead.address && lead.address.length > 10) score += 5;

  // Rating quality (max 15 points)
  if (lead.rating && lead.rating > 0) {
    score += Math.min(lead.rating * 3, 15);
  }

  // Category specificity (max 10 points)
  if (lead.category && lead.category !== 'Other') score += 10;

  // Verification bonus (max 5 points)
  if (lead.verified) score += 5;

  return Math.min(score, 100);
}

/**
 * Batch score multiple leads
 */
function batchScoreLeads(leads) {
  return leads.map(lead => ({
    ...lead,
    score: calculateLeadScore(lead)
  }));
}

/**
 * Categorize lead quality
 */
function getLeadQuality(score) {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Cold';
  return 'Low';
}

module.exports = {
  calculateLeadScore,
  batchScoreLeads,
  getLeadQuality
};