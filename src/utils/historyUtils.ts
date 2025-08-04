import moment from "moment";
import { HistoryItem } from "../components/dashboard/History";

export interface TrackItem {
  role: string;
  status: string;
  comment?: string;
  created_at: string;
  remarks?: string;
  unique_number?: string;
  message?: string;
}

/**
 * Transforms tracks data from API response into History component format
 * @param tracks - Array of track items from API response
 * @returns Array of HistoryItem objects for the History component
 */
export const transformTracksToHistory = (tracks: TrackItem[]): HistoryItem[] => {
  if (!tracks || !Array.isArray(tracks)) {
    return [];
  }

  return tracks.map((track, index) => ({
    id: `track-${index}`, // Use index as unique identifier
    date: moment(track.created_at).format("MMM DD, YYYY"), // Format: Aug 04, 2025
    time: moment(track.created_at).format("hh:mm A"), // Format: 08:08 PM
    title: `${track.status}`, // Main title showing the status
    description: createTrackDescription(track), // Detailed description
  }));
};

/**
 * Creates a detailed description for a track item
 * @param track - Individual track item
 * @returns Formatted description string
 */
const createTrackDescription = (track: TrackItem): string => {
  const parts: string[] = [];

  // Add approved/created date
  if (track.created_at) {
    parts.push(`Approved at: ${track.created_at}`);
  }

  // Add remarks if available
  if (track.remarks && track.remarks.trim()) {
    parts.push(`Remarks: ${track.remarks}`);
  }

  // Add comment if available
  if (track.comment && track.comment.trim()) {
    parts.push(`Comment: ${track.comment}`);
  }

  // Add status
  if (track.status) {
    parts.push(`Status: ${track.status}`);
  }

  return parts.join('\n');
};

/**
 * Alternative formatting function that creates a more concise description
 * @param tracks - Array of track items from API response  
 * @returns Array of HistoryItem objects with concise descriptions
 */
export const transformTracksToHistoryCompact = (tracks: TrackItem[]): HistoryItem[] => {
  if (!tracks || !Array.isArray(tracks)) {
    return [];
  }

  return tracks.map((track, index) => ({
    id: `track-${index}`,
    date: moment(track.created_at).format("MMM DD, YYYY"),
    time: moment(track.created_at).format("hh:mm A"),
    title: track.status,
    description: track.remarks || track.comment || `${track.role} - ${track.status}`,
  }));
};
