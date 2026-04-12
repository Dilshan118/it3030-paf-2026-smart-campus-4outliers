import React, { useEffect, useState } from 'react';

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
        setTimeLeft('SLA Breached!');
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
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      backgroundColor: isBreached ? '#ffeded' : '#edfff5',
      color: isBreached ? '#cc0000' : '#00994d',
      border: `1px solid ${isBreached ? '#ffcccc' : '#b3ffd1'}`
    }}>
      ⏱ {timeLeft}
    </div>
  );
}
