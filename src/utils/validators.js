/**
 * Validation utilities for startup idea submissions
 */

export const validateIdeaForm = (formData) => {
  const errors = {};

  const startupName = formData.startupName || formData.title || '';
  const ideaDescription = formData.ideaDescription || formData.description || '';
  const targetCustomers = formData.targetCustomers || '';
  const targetMarket = formData.targetMarket || '';

  if (!startupName.trim() || startupName.trim().length < 2) {
    errors.startupName = 'Startup name or concept must be at least 2 characters.';
  }

  if (!ideaDescription.trim() || ideaDescription.trim().length < 15) {
    errors.ideaDescription = 'Please provide a clear description (at least 15 characters).';
  }

  if (!targetCustomers.trim() || targetCustomers.trim().length < 3) {
    errors.targetCustomers = 'Please specify your target customers (e.g. college students, MSMEs, doctors).';
  }

  if (!targetMarket.trim() || targetMarket.trim().length < 2) {
    errors.targetMarket = 'Please specify your target market (e.g. India Pan-National, Tier 2/3 cities, Global SaaS).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default validateIdeaForm;
