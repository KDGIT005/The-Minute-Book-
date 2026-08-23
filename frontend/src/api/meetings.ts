import type { MeetingListItem, MeetingDetail, StatusResponse, ActionItem } from '../types/meeting';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : (import.meta.env.PROD ? 'https://minute-book-backend.onrender.com' : '');
const BASE_URL = `${API_BASE}/api/meetings`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let message: string;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      message = text || `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }
  return response.json();
}

export async function uploadMeeting(file: File, title: string): Promise<StatusResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch(BASE_URL, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<StatusResponse>(response);
}

export async function listMeetings(): Promise<MeetingListItem[]> {
  const response = await fetch(BASE_URL);
  return handleResponse<MeetingListItem[]>(response);
}

export async function getMeeting(id: string): Promise<MeetingDetail> {
  const response = await fetch(`${BASE_URL}/${id}`);
  return handleResponse<MeetingDetail>(response);
}

export async function getMeetingStatus(id: string): Promise<StatusResponse> {
  const response = await fetch(`${BASE_URL}/${id}/status`);
  return handleResponse<StatusResponse>(response);
}

export async function updateActionItem(
  meetingId: string,
  itemId: string,
  update: Partial<Pick<ActionItem, 'task' | 'owner' | 'deadline' | 'priority' | 'isComplete'>>
): Promise<ActionItem> {
  const response = await fetch(`${BASE_URL}/${meetingId}/action-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return handleResponse<ActionItem>(response);
}

export async function exportMeeting(id: string, format: 'md' | 'json' | 'srt'): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/${id}/export?format=${format}`);
  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }
  return response.blob();
}

export async function deleteMeeting(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`);
  }
}
