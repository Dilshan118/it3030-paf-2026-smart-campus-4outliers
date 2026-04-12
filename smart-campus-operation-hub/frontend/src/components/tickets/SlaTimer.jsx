import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

export default function SlaTimer({ deadline, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    if (status === 'RESOLVED' || status === 'CLOSED' || status === 'REJECTED') {
      setTimeLeft('Timer Stopped');
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('SLA Breached');
        setIsBreached(true);
        return;
      }

      setIsBreached(false);
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${h}h ${m}m remaining`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '99px',
      fontWeight: '600',
      fontSize: '13px',
      backgroundColor: isBreached ? '#fee2e2' : 'var(--surface-container-low)',
      color: isBreached ? '#991b1b' : 'var(--on-surface)'
    }}>
      <Timer size={16} strokeWidth={2} />
      {timeLeft}
    </div>
  );
}
