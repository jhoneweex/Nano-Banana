
import React from 'react';

interface SpinnerProps {
  large?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ large = false }) => {
  const sizeClasses = large ? 'h-12 w-12' : 'h-5 w-5';
  const marginClass = large ? '' : 'me-3';

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${sizeClasses} ${marginClass}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
