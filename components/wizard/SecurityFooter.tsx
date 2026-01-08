'use client';

import { Lock } from 'lucide-react';

export function SecurityFooter() {
  return (
    <div className="security-footer">
      <Lock className="w-4 h-4" />
      <span>Secure and encrypted payment.</span>
    </div>
  );
}
