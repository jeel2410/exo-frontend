import React from "react";

let eurFlagIdCounter = 0;

const EURFlag: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const maskId = React.useMemo(() => `eur-mask-${++eurFlagIdCounter}`, []);
  return (
    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="21" height="15" rx="2" fill="#003399"/>
      <mask id={maskId} style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="15">
        <rect width="21" height="15" rx="2" fill="white"/>
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M10.5 2.5L10.7 3.2H11.4L10.8 3.6L11 4.3L10.5 3.9L10 4.3L10.2 3.6L9.6 3.2H10.3L10.5 2.5Z" fill="#FFCC00"/>
        <path d="M13.2 3.5L13.4 4.2H14.1L13.5 4.6L13.7 5.3L13.2 4.9L12.7 5.3L12.9 4.6L12.3 4.2H13L13.2 3.5Z" fill="#FFCC00"/>
        <path d="M14.8 5.8L15 6.5H15.7L15.1 6.9L15.3 7.6L14.8 7.2L14.3 7.6L14.5 6.9L13.9 6.5H14.6L14.8 5.8Z" fill="#FFCC00"/>
        <path d="M15 9L15.2 9.7H15.9L15.3 10.1L15.5 10.8L15 10.4L14.5 10.8L14.7 10.1L14.1 9.7H14.8L15 9Z" fill="#FFCC00"/>
        <path d="M13.2 11L13.4 11.7H14.1L13.5 12.1L13.7 12.8L13.2 12.4L12.7 12.8L12.9 12.1L12.3 11.7H13L13.2 11Z" fill="#FFCC00"/>
        <path d="M10.5 12L10.7 12.7H11.4L10.8 13.1L11 13.8L10.5 13.4L10 13.8L10.2 13.1L9.6 12.7H10.3L10.5 12Z" fill="#FFCC00"/>
        <path d="M7.8 11L8 11.7H8.7L8.1 12.1L8.3 12.8L7.8 12.4L7.3 12.8L7.5 12.1L6.9 11.7H7.6L7.8 11Z" fill="#FFCC00"/>
        <path d="M6 9L6.2 9.7H6.9L6.3 10.1L6.5 10.8L6 10.4L5.5 10.8L5.7 10.1L5.1 9.7H5.8L6 9Z" fill="#FFCC00"/>
        <path d="M6.2 5.8L6.4 6.5H7.1L6.5 6.9L6.7 7.6L6.2 7.2L5.7 7.6L5.9 6.9L5.3 6.5H6L6.2 5.8Z" fill="#FFCC00"/>
        <path d="M7.8 3.5L8 4.2H8.7L8.1 4.6L8.3 5.3L7.8 4.9L7.3 5.3L7.5 4.6L6.9 4.2H7.6L7.8 3.5Z" fill="#FFCC00"/>
        <path d="M4.5 7.5L4.7 8.2H5.4L4.8 8.6L5 9.3L4.5 8.9L4 9.3L4.2 8.6L3.6 8.2H4.3L4.5 7.5Z" fill="#FFCC00"/>
        <path d="M16.5 7.5L16.7 8.2H17.4L16.8 8.6L17 9.3L16.5 8.9L16 9.3L16.2 8.6L15.6 8.2H16.3L16.5 7.5Z" fill="#FFCC00"/>
      </g>
    </svg>
  );
};

export default EURFlag;
