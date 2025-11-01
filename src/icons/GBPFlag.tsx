import React from "react";

let gbpFlagIdCounter = 0;

const GBPFlag: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const maskId = React.useMemo(() => `gbp-mask-${++gbpFlagIdCounter}`, []);
  return (
    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="21" height="15" rx="2" fill="#012169"/>
      <mask id={maskId} style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="15">
        <rect width="21" height="15" rx="2" fill="white"/>
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M0 0L7 5L0 10V0Z" fill="white"/>
        <path d="M21 0L14 5L21 10V0Z" fill="white"/>
        <path d="M8.75 0H12.25V15H8.75V0Z" fill="white"/>
        <path d="M0 5H21V10H0V5Z" fill="white"/>
        <path d="M0 6H21V9H0V6Z" fill="#C8102E"/>
        <path d="M9.5 0H11.5V15H9.5V0Z" fill="#C8102E"/>
        <path d="M0 0L7 5H4.2L0 2.5V0Z" fill="#C8102E"/>
        <path d="M21 0L14 5H16.8L21 2.5V0Z" fill="#C8102E"/>
        <path d="M0 15L7 10H4.2L0 12.5V15Z" fill="#C8102E"/>
        <path d="M21 15L14 10H16.8L21 12.5V15Z" fill="#C8102E"/>
      </g>
    </svg>
  );
};

export default GBPFlag;
