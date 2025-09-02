import React from 'react';

interface UploadIconProps {
  className?: string;
  size?: number;
}

const UploadIcon: React.FC<UploadIconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud shape */}
      <path
        d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow up */}
      <path
        d="m12 8-4 4h3v4h2v-4h3l-4-4Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default UploadIcon;
