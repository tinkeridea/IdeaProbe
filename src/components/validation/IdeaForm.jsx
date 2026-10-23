import React, { useState } from 'react';
import { validateIdeaForm } from '../../utils/validators';
import StatusBadge from '../common/StatusBadge';
import './IdeaForm.css';

export function IdeaForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    startupName: '',
    ideaDescription: '',
    targetCustomers: '',
    targetMarket: 'India (Pan-National)',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error on edit if field was previously touched
    if (touched[name]) {
      const validation = validateIdeaForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: validation.errors[name],
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validation = validateIdeaForm(formData);
    setErrors(validation.errors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      startupName: true,
      ideaDescription: true,
      targetCustomers: true,
      targetMarket: true,
    });

    const validation = validateIdeaForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  const handleLoadSample = () => {
    const sample = {
      startupName: 'KiranaFlow AI',
      ideaDescription: 'Automated inventory forecasting and WhatsApp-based reordering platform designed specifically for small local kirana store owners across Indian tier-2 cities.',
      targetCustomers: 'Independent Indian retail kirana shop owners and local suppliers',
      targetMarket: 'India Tier-2 & Tier-3 Cities',
    };
    setFormData(sample);
    setErrors({});
  };

  return (
    <section className="idea-form-section">
      <div className="container idea-form__container">
        <div className="idea-form__header">
          <div className="idea-form__badges">
            <StatusBadge type="violet">Step 2: Intake</StatusBadge>
            <StatusBadge type="peach">Confidential & Encrypted</StatusBadge>
          </div>
          <h2 className="idea-form__title">Validate Your Startup Idea</h2>
          <p className="idea-form__subtitle">
            Provide the core details of your venture. Our validation pipeline evaluates market demand, 
            customer personas, competitors, and viability risks.
          </p>
          <div className="idea-form__quick-fill">
            <button
              type="button"
              className="btn-text-sample"
              onClick={handleLoadSample}
            >
              Fill Example: KiranaFlow AI
            </button>
          </div>
        </div>

        <form className="idea-form" onSubmit={handleSubmit} noValidate>
          {/* Startup Name */}
          <div className="form-group">
            <label htmlFor="startupName" className="form-label">
              Startup Name or Working Title <span className="required">*</span>
            </label>
            <input
              id="startupName"
              name="startupName"
              type="text"
              className={`form-input ${errors.startupName ? 'form-input--error' : ''}`}
              placeholder="e.g. KiranaFlow, EduSprint, AgroPulse"
              value={formData.startupName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.startupName && (
              <span className="form-error" role="alert">{errors.startupName}</span>
            )}
          </div>

          {/* Idea Description */}
          <div className="form-group">
            <label htmlFor="ideaDescription" className="form-label">
              Idea Description & Problem Statement <span className="required">*</span>
            </label>
            <textarea
              id="ideaDescription"
              name="ideaDescription"
              rows={4}
              className={`form-textarea ${errors.ideaDescription ? 'form-textarea--error' : ''}`}
              placeholder="What core problem are you solving? What is your proposed solution or unique innovation?"
              value={formData.ideaDescription}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="form-help">
              <span>Be specific about the customer pain and how your product resolves it.</span>
              <span>{formData.ideaDescription.length} characters</span>
            </div>
            {errors.ideaDescription && (
              <span className="form-error" role="alert">{errors.ideaDescription}</span>
            )}
          </div>

          <div className="form-row">
            {/* Target Customers */}
            <div className="form-group">
              <label htmlFor="targetCustomers" className="form-label">
                Target Customers <span className="required">*</span>
              </label>
              <input
                id="targetCustomers"
                name="targetCustomers"
                type="text"
                className={`form-input ${errors.targetCustomers ? 'form-input--error' : ''}`}
                placeholder="e.g. Kirana store owners, Tier-2 college students"
                value={formData.targetCustomers}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.targetCustomers && (
                <span className="form-error" role="alert">{errors.targetCustomers}</span>
              )}
            </div>

            {/* Target Market */}
            <div className="form-group">
              <label htmlFor="targetMarket" className="form-label">
                Target Market / Geography <span className="required">*</span>
              </label>
              <select
                id="targetMarket"
                name="targetMarket"
                className={`form-select ${errors.targetMarket ? 'form-select--error' : ''}`}
                value={formData.targetMarket}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="India (Pan-National)">India (Pan-National)</option>
                <option value="India Tier-1 Metros">India Tier-1 Metros (Bengaluru, Delhi-NCR, Mumbai, etc.)</option>
                <option value="India Tier-2 & Tier-3 Cities">India Tier-2 & Tier-3 Cities</option>
                <option value="Rural / Bharat Focus">Rural / Bharat Focus</option>
                <option value="Global B2B SaaS (Cross-border)">Global B2B SaaS (Cross-border)</option>
              </select>
              {errors.targetMarket && (
                <span className="form-error" role="alert">{errors.targetMarket}</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-pill-secondary"
              onClick={onCancel}
            >
              Back to Overview
            </button>

            <button
              type="submit"
              className="btn-pill-primary"
            >
              Run AI Validation →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default IdeaForm;
