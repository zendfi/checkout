'use client';

import { CheckIcon } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { number: 1, label: 'Personal Information' },
  { number: 2, label: 'Payment Method' },
];

export function ProgressIndicator({ currentStep, totalSteps = 2 }: ProgressIndicatorProps) {
  return (
    <div className="progress-indicator">
      {steps.slice(0, totalSteps).map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="progress-step">
              <div
                className={`progress-circle ${
                  isCompleted ? 'completed' : isActive ? 'active' : 'inactive'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`progress-label hidden sm:block ${
                  isActive ? 'active' : isCompleted ? 'active' : 'inactive'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`progress-connector ${isCompleted ? 'completed' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
