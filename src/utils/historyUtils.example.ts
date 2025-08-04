// Example usage of historyUtils.ts

import { transformTracksToHistory, transformTracksToHistoryCompact, TrackItem } from './historyUtils';

// Example tracks data from your API response
const exampleTracksData: TrackItem[] = [
  {
    role: "Super Admin",
    status: "Coordinator Review", 
    comment: "approved",
    created_at: "2025-08-04T20:08:23.000000Z",
    remarks: "Request moved to Coordinator Review stage",
    unique_number: "REQ935610",
    message: "Success"
  },
  {
    role: "Coordinator",
    status: "Financial Review",
    comment: "needs clarification",
    created_at: "2025-08-05T10:15:30.000000Z",
    remarks: "Forwarded to financial team for review",
    unique_number: "REQ935610",
    message: "Success"
  }
];

// Usage Example 1: Basic transformation
const historyItems = transformTracksToHistory(exampleTracksData);
console.log('Detailed History Items:', historyItems);

// Result will be:
/*
[
  {
    id: "track-0",
    date: "Aug 04, 2025",
    time: "08:08 PM",
    title: "Coordinator Review",
    description: "Approved at: 2025-08-04T20:08:23.000000Z\nRemarks: Request moved to Coordinator Review stage\nComment: approved\nStatus: Coordinator Review"
  },
  {
    id: "track-1", 
    date: "Aug 05, 2025",
    time: "10:15 AM",
    title: "Financial Review",
    description: "Approved at: 2025-08-05T10:15:30.000000Z\nRemarks: Forwarded to financial team for review\nComment: needs clarification\nStatus: Financial Review"
  }
]
*/

// Usage Example 2: Compact transformation (shorter descriptions)
const compactHistoryItems = transformTracksToHistoryCompact(exampleTracksData);
console.log('Compact History Items:', compactHistoryItems);

// Result will be:
/*
[
  {
    id: "track-0",
    date: "Aug 04, 2025", 
    time: "08:08 PM",
    title: "Coordinator Review",
    description: "Request moved to Coordinator Review stage"
  },
  {
    id: "track-1",
    date: "Aug 05, 2025",
    time: "10:15 AM", 
    title: "Financial Review",
    description: "Forwarded to financial team for review"
  }
]
*/

// Usage Example 3: In a React component
/*
import React, { useEffect, useState } from 'react';
import { transformTracksToHistory } from '../utils/historyUtils';
import History from '../components/dashboard/History';

const MyComponent = ({ requestData }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (requestData?.tracks) {
      const transformedHistory = transformTracksToHistory(requestData.tracks);
      setHistory(transformedHistory);
    }
  }, [requestData]);

  return (
    <div>
      <h2>Request History</h2>
      <History items={history} />
    </div>
  );
};
*/

// Usage Example 4: Error handling
const safeTransformTracks = (tracks: any) => {
  try {
    return transformTracksToHistory(tracks);
  } catch (error) {
    console.error('Error transforming tracks:', error);
    return []; // Return empty array on error
  }
};

export {
  exampleTracksData,
  historyItems,
  compactHistoryItems,
  safeTransformTracks
};
