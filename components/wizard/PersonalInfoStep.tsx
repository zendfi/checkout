'use client';

import { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { User, Mail, DollarSign, ArrowRight } from 'lucide-react';

interface PersonalInfoStepProps {
  onContinue: () => void;
}

export function PersonalInfoStep({ onContinue }: PersonalInfoStepProps) {
  const { 
    checkoutData, 
    amount, 
    setAmount,
    setCustomerName,
    setCustomerEmail,
    customerName: storedName,
    customerEmail: storedEmail,
  } = useCheckoutStore();
  
  const [email, setEmail] = useState(storedEmail || '');
  const [name, setName] = useState(storedName || '');
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize amount from checkout data
  useEffect(() => {
    if (checkoutData?.amount_usd && amount === 0) {
      setAmount(checkoutData.amount_usd);
    }
  }, [checkoutData?.amount_usd, amount, setAmount]);

  const isFormValid = () => {
    if (!email || !email.includes('@') || !email.includes('.')) return false;
    if (checkoutData?.allow_custom_amount && amount <= 0) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@') || !email.includes('.')) {
      setEmailError(true);
      return;
    }

    if (!checkoutData?.payment_id) return;

    setIsSubmitting(true);

    try {
      const customerData: { email: string; name?: string } = { email };
      if (name.trim()) {
        customerData.name = name.trim();
      }

      await api.submitCustomerInfo(checkoutData.payment_id, customerData);
      console.log('Customer info saved');
      
      // Save to store for summary display
      setCustomerEmail(email);
      setCustomerName(name.trim());
      
      onContinue();
    } catch (error) {
      console.error('Error saving customer info:', error);
      alert('Failed to save information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAmountInput = checkoutData?.allow_custom_amount;

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input (if PWYW) */}
        {showAmountInput && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter Amount<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <DollarSign className="w-5 h-5" />
              </span>
              <input
                type="number"
                className="form-input"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min={checkoutData?.minimum_amount || 0}
                max={checkoutData?.maximum_amount || undefined}
                step="0.01"
                required
              />
              <span className="input-icon input-icon-right text-gray-400 font-medium">
                USD
              </span>
            </div>
            {checkoutData?.minimum_amount && (
              <p className="text-xs text-gray-500">
                Minimum: ${checkoutData.minimum_amount.toFixed(2)}
                {checkoutData?.maximum_amount && ` • Maximum: $${checkoutData.maximum_amount.toFixed(2)}`}
              </p>
            )}
          </div>
        )}

        {/* Fixed Amount Display (if not PWYW) */}
        {!showAmountInput && checkoutData && (
          <div className="amount-display">
            <span className="amount-value">
              ${checkoutData.amount_usd.toFixed(2)}
            </span>
            <span className="amount-currency">USD</span>
          </div>
        )}

        {/* Section Title */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Enter Personal Information
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;ll send your receipt to this email
          </p>
        </div>

        {/* Full Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="input-with-icon">
            <span className="input-icon">
              <User className="w-5 h-5" />
            </span>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Address<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon">
              <Mail className="w-5 h-5" />
            </span>
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
          </div>
          {emailError ? (
            <p className="text-sm text-red-500">Please enter a valid email address</p>
          ) : (
            <p className="text-xs text-gray-400">
              We use this to send you a confirmation of your payment
            </p>
          )}
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="btn btn-primary mt-8"
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
