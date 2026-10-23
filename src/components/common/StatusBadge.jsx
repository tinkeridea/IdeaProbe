import React from 'react';
import './StatusBadge.css';

export function StatusBadge({ type = 'ready', children }) {
  return (
    <span className={`status-badge status-badge--${type}`}>
      <span className="status-badge__dot" />
      <span className="status-badge__label">{children}</span>
    </span>
  );
}

export default StatusBadge;
