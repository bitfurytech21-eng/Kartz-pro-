import { getAccessToken } from './firebaseAuth';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

export interface CreateEventParams {
  summary: string;
  location?: string;
  description?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  timeZone?: string;
  attendeeEmail?: string;
}

const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch upcoming events from the user's primary Google Calendar
 */
export async function listUpcomingEvents(maxResults: number = 20): Promise<CalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const now = new Date();
  const url = `${CALENDAR_BASE_URL}/calendars/primary/events?timeMin=${encodeURIComponent(
    now.toISOString()
  )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list calendar events: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return (data.items || []) as CalendarEvent[];
}

/**
 * Create a new event on user's primary Google Calendar
 */
export async function createCalendarEvent(params: CreateEventParams): Promise<CalendarEvent> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const userTimeZone = params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const body: any = {
    summary: params.summary,
    description: params.description,
    location: params.location,
    start: {
      dateTime: params.startDateTime,
      timeZone: userTimeZone,
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: userTimeZone,
    },
  };

  if (params.attendeeEmail) {
    body.attendees = [{ email: params.attendeeEmail }];
  }

  const res = await fetch(`${CALENDAR_BASE_URL}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create calendar event: ${res.status} ${errText}`);
  }

  return await res.json();
}

/**
 * Delete an event from user's primary Google Calendar
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await fetch(`${CALENDAR_BASE_URL}/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete calendar event: ${res.status} ${errText}`);
  }

  return true;
}
