'use client';

import { Lock } from 'lucide-react';

export function SecurityFooter() {
  return (
    <div className="security-footer text-[10px] sm:text-xs py-2 sm:py-3">
      <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
      <span>Secure and encrypted payment.</span>
    </div>
  );
}
