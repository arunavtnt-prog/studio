import React from 'react';

/**
 * Health Badge Component
 *
 * Displays a color-coded health status badge.
 */
const HealthBadge = ({ status, score, showScore = true }) => {
  const colors = {
    Green: 'badge-green',
    Yellow: 'badge-yellow',
    Red: 'badge-red',
  };

  return (
    <span className={`badge ${colors[status] || 'badge-blue'}`}>
      {status} {showScore && score !== undefined && `(${score})`}
    </span>
  );
};

export default HealthBadge;
