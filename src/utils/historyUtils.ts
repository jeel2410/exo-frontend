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
 * Deduplicate tracks by stage/status, keeping the most recent (by created_at)
 */
export const dedupeTracksByStatus = (tracks: TrackItem[]): TrackItem[] => {
  if (!tracks || !Array.isArray(tracks)) return [];

  const byStatus = new Map<string, TrackItem>();
  for (const tr of tracks) {
    const key = (tr.status || tr.role || '').toLowerCase();
    if (!byStatus.has(key)) {
      byStatus.set(key, tr);
    } else {
      const prev = byStatus.get(key)!;
      const prevTime = new Date(prev.created_at).getTime();
      const currTime = new Date(tr.created_at).getTime();
      if (!isNaN(currTime) && (isNaN(prevTime) || currTime >= prevTime)) {
        byStatus.set(key, tr);
      }
    }
  }
  // Return sorted chronologically by created_at
  return Array.from(byStatus.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

/**
 * Apply dedupe and then slice to show tracks based on options
 */
export const getVisibleTracks = (
  tracks: TrackItem[],
  options?: { includeCurrent?: boolean; preserveAll?: boolean }
): TrackItem[] => {
  // First deduplicate tracks by status
  const deduped = dedupeTracksByStatus(tracks || []);
  if (!deduped.length) return deduped;
  
  // Return all tracks if includeCurrent or preserveAll is true
  if (options?.includeCurrent || options?.preserveAll) return deduped;
  
  // Otherwise, return all except the last one (N-1)
  return deduped.slice(0, -1);
};

/** Options for transforming tracks into history items */
export interface HistoryTransformOptions {
  includeStatus?: boolean; // default false: don't include Status in description
  lastEntrySubStatus?: string | null | undefined; // if provided, append to last item's description
  translateStatus?: (status: string) => string; // optional translator for titles
  labels?: {
    approvedAt: string;
    remarks: string;
    comment: string;
    subStatus: string;
  };
}

/**
 * Transforms tracks data from API response into History component format
 * @param tracks - Array of track items from API response
 * @returns Array of HistoryItem objects for the History component
 */
export const transformTracksToHistory = (
  tracks: TrackItem[],
  options?: HistoryTransformOptions
): HistoryItem[] => {
  if (!tracks || !Array.isArray(tracks)) {
    return [];
  }

  const includeStatus = options?.includeStatus ?? false;

  const items = tracks.map((track, index) => ({
    id: `track-${index}`,
    date: moment(track.created_at).format("MMM DD, YYYY"),
    time: moment(track.created_at).format("hh:mm A"),
    title: options?.translateStatus ? options.translateStatus(track.status) : `${track.status}`,
    description: createTrackDescription(track, includeStatus, options?.labels),
  }));

  if (items.length > 0 && options?.lastEntrySubStatus) {
    const lastIdx = items.length - 1;
    const label = options?.labels?.subStatus || "Sub status";
    const suffix = `\n${label}: ${options.lastEntrySubStatus}`;
    items[lastIdx].description = (items[lastIdx].description || "") + suffix;
  }

  return items;
};

/**
 * Creates a detailed description for a track item
 * @param track - Individual track item
 * @returns Formatted description string
 */
const createTrackDescription = (
  track: TrackItem,
  includeStatus: boolean = false,
  labels?: { approvedAt: string; remarks: string; comment: string }
): string => {
  const parts: string[] = [];

  // Add approved/created date
  if (track.created_at) {
    parts.push(`${labels?.approvedAt || "Approved at"}: ${track.created_at}`);
  }

  // Add remarks if available
  if (track.remarks && track.remarks.trim()) {
    parts.push(`${labels?.remarks || "Remarks"}: ${track.remarks}`);
  }

  // Add comment if available
  if (track.comment && track.comment.trim()) {
    parts.push(`${labels?.comment || "Comment"}: ${track.comment}`);
  }

  // Optionally include status
  if (includeStatus && track.status) {
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
