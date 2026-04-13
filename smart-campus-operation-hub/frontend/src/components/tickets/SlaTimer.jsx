import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

export default function SlaTimer({ deadline, status }) {
  const [now, setNow] = useState(() => new Date());
  const isStopped = status === 'RESOLVED' || status === 'CLOSED' || status === 'REJECTED';

  useEffect(() => {
    if (isStopped) {
      return;
    }

    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, [isStopped]);

  const target = new Date(deadline);
  const diff = target - now;
  const isBreached = !isStopped && diff <= 0;

  const timeLeft = (() => {
    if (isStopped) return 'Timer Stopped';
    if (Number.isNaN(target.getTime())) return 'Invalid Deadline';
    if (isBreached) return 'SLA Breached';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return `${h}h ${m}m remaining`;
  })();

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
