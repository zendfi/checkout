'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  expiresAt: string;
}

export function Timer({ expiresAt }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

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

      // Urgent when less than 2 minutes
      setIsUrgent(diff < 120000);

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="expiry-timer urgent">
        <AlertTriangle className="w-4 h-4" />
        <span>Payment expired</span>
      </div>
    );
  }

  return (
    <div className={`expiry-timer ${isUrgent ? 'urgent' : ''}`}>
      <Clock className="w-4 h-4" />
      <span>Expires in {timeLeft}</span>
    </div>
  );
}
