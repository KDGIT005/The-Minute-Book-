export type MeetingStatus = 'QUEUED' | 'TRANSCRIBING' | 'SUMMARIZING' | 'DONE' | 'FAILED';

export interface MeetingListItem {
  id: string;
  title: string;
  status: MeetingStatus;
  durationSeconds: number | null;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  speakerLabel: string | null;
  startTime: number;
  endTime: number;
  text: string;
  sequence: number;
}

export interface KeyDecision {
  id: string;
  decision: string;
  context: string | null;
  sourceTimestamp: number | null;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  deadline: string | null;
  priority: 'high' | 'medium' | 'low';
  sourceTimestamp: number | null;
  isComplete: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
}

export interface MeetingDetail {
  id: string;
  title: string;
  status: MeetingStatus;
  durationSeconds: number | null;
  summary: string | null;
  createdAt: string;
  transcriptSegments: TranscriptSegment[];
  keyDecisions: KeyDecision[];
  actionItems: ActionItem[];
  chapters: Chapter[];
}

export interface StatusResponse {
  id: string;
  status: MeetingStatus;
}
