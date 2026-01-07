'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  expiresAt: string;
}

export function Timer({ expiresAt }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={`text-center py-4 text-sm font-medium ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
      {isExpired ? 'Payment expired' : `Expires in ${timeLeft}`}
    </div>
  );
}
