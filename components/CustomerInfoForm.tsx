'use client';

import { useState } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { CheckIcon } from '@/components/icons';

export function CustomerInfoForm() {
  const { checkoutData, customerInfoSubmitted, setCustomerInfoSubmitted } = useCheckoutStore();
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@') || !email.includes('.')) {
      setEmailError(true);
      return;
    }

    if (!checkoutData?.payment_id) return;

    setIsSubmitting(true);

    try {
      const customerData: any = { email };

      if (name) customerData.name = name;
      if (phone) customerData.phone = phone;
      if (company) customerData.company = company;

      if (addressLine1) {
        customerData.billing_address = {
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
          city: city || '',
          state: state || null,
          postal_code: postalCode || '',
          country: country?.toUpperCase() || 'US',
        };
      }

      await api.submitCustomerInfo(checkoutData.payment_id, customerData);
      console.log('Customer info saved');

      setCustomerInfoSubmitted(true);
    } catch (error) {
      console.error('Error saving customer info:', error);
      alert('Failed to save information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customerInfoSubmitted) {
    return (
      <div className="customer-info-section mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckIcon className="w-5 h-5" />
          <span className="font-medium">Contact information saved successfully</span>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-info-section">
      <h3 className="font-semibold text-gray-900 mb-1">Contact Information</h3>
      <p className="text-gray-500 text-sm mb-4">Receive your payment receipt via email</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="email"
            className={`form-input ${emailError ? 'error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            placeholder="you@example.com"
            required
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="flex items-center gap-2 my-4">
          <input
            type="checkbox"
            id="show-optional-fields"
            checked={showOptionalFields}
            onChange={(e) => setShowOptionalFields(e.target.checked)}
            className="w-4 h-4 accent-brand-purple"
          />
          <label htmlFor="show-optional-fields" className="text-sm text-gray-600">
            Add phone & address (optional)
          </label>
        </div>

        {showOptionalFields && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company (optional)
              </label>
              <input
                type="text"
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              <input
                type="text"
                className="form-input mb-2"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address"
              />
              <input
                type="text"
                className="form-input"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apt, suite, etc. (optional)"
              />
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="94102"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="US"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>
      </form>
    </div>
  );
}
