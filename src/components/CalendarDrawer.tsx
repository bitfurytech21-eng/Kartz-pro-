import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  Plus,
  RefreshCw,
  Check,
  AlertTriangle,
  ExternalLink,
  User as UserIcon,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Building2,
  Mail,
  Send,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleSignInRedirect,
  logout,
  parseAuthError,
  AuthErrorInfo,
} from '../services/firebaseAuth';
import {
  listUpcomingEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent,
} from '../services/calendarApi';
import { Property } from '../types';

interface CalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProperty?: Property | null;
}

export const CalendarDrawer: React.FC<CalendarDrawerProps> = ({
  isOpen,
  onClose,
  prefillProperty,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  // Unauthenticated screen mode: 'google' | 'direct'
  const [unauthMode, setUnauthMode] = useState<'google' | 'direct'>('google');

  // Tabs: 'schedule' | 'create' | 'detail'
  const [activeTab, setActiveTab] = useState<'schedule' | 'create' | 'detail'>('schedule');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'viewings'>('all');

  // Create event form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:30');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [appointmentType, setAppointmentType] = useState<'viewing' | 'consultation' | 'aviation'>('viewing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mandatory confirmation modal for mutating operations (creating/deleting events)
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'delete';
    title: string;
    description: string;
    data?: any;
  } | null>(null);

  // Synchronize auth state
  useEffect(() => {
    const unsub = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(Boolean(token));
        setErrorMessage(null);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsub();
  }, []);

  // Initialize default date to tomorrow at 11:00
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setEventDate(dateStr);
  }, []);

  // Handle prefill property
  useEffect(() => {
    if (prefillProperty) {
      setTitle(`Private Viewing: ${prefillProperty.title} (Ref: ${prefillProperty.ref})`);
      setLocation(`${prefillProperty.location}, France`);
      setAttendeeEmail(prefillProperty.agent?.email || 'info@kretz.site');
      setDescription(
        `Confidential property viewing with Kretz Real Estate.\n\n` +
        `Property: ${prefillProperty.title}\n` +
        `Reference: ${prefillProperty.ref}\n` +
        `Location: ${prefillProperty.location}\n` +
        `Representative Agent: ${prefillProperty.agent?.name} (${prefillProperty.agent?.phone || '+33 7 53 07 75 72'})\n\n` +
        `Notes: Please ensure discreet arrival at designated estate gates. Buyer identity confidential.`
      );
      setActiveTab('create');
    }
  }, [prefillProperty]);

  // Load events when drawer is open and authenticated
  useEffect(() => {
    if (isOpen && hasToken) {
      loadEvents();
    }
  }, [isOpen, hasToken]);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    setErrorMessage(null);
    setAuthError(null);
    try {
      const items = await listUpcomingEvents(30);
      setEvents(items);
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err);
      if (err.message === 'AUTH_EXPIRED' || err.message === 'AUTH_REQUIRED') {
        setHasToken(false);
      } else {
        setErrorMessage('Unable to load Google Calendar events. Please try again.');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setAuthError(null);
    try {
      const result = await googleSignIn({ withCalendarScopes: true, useRedirectOnBlocked: false });
      if (result) {
        setUser(result.user);
        setHasToken(true);
        loadEvents();
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/cancelled-popup-request' &&
        err?.code !== 'auth/popup-closed-by-user'
      ) {
        console.error('Google Sign In error:', err);
        const parsed = parseAuthError(err);
        setAuthError(parsed);
        setErrorMessage(parsed.message);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setAuthError(null);
    try {
      await googleSignInRedirect(true);
    } catch (err: any) {
      console.error('Google Redirect Sign In error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      setErrorMessage(parsed.message);
      setIsAuthenticating(false);
    }
  };

  const handleDirectConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !startTime) {
      setErrorMessage('Please provide an appointment subject, preferred date, and time.');
      return;
    }
    if (!attendeeEmail.trim() && !clientPhone.trim()) {
      setErrorMessage('Please provide an email address or telephone number for confirmation.');
      return;
    }

    const typeLabels = {
      viewing: 'Confidential Property Viewing',
      consultation: 'Acquisition & Portfolio Consultation',
      aviation: 'Private Aviation & Logistics Coordination',
    };

    const subject = encodeURIComponent(`[Appointment Request] ${typeLabels[appointmentType]}: ${title}`);
    const bodyContent = [
      `Dear Kretz Real Estate Advisory,`,
      ``,
      `I would like to schedule a ${typeLabels[appointmentType]}:`,
      ``,
      `Subject / Property: ${title}`,
      `Preferred Date: ${eventDate}`,
      `Preferred Time: ${startTime} - ${endTime}`,
      location ? `Location: ${location}` : null,
      ``,
      `Client Contact Information:`,
      clientName ? `Name: ${clientName}` : null,
      attendeeEmail ? `Email: ${attendeeEmail}` : null,
      clientPhone ? `Phone: ${clientPhone}` : null,
      ``,
      description ? `Special Requests / Confidential Notes:\n${description}` : null,
      ``,
      `Please confirm availability via email or private call.`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const mailtoUrl = `mailto:info@kretz.site?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
    window.location.href = mailtoUrl;

    setActionSuccess('Appointment request dispatched to Kretz Private Office (info@kretz.site). Our senior advisor will confirm shortly.');
    setErrorMessage(null);
    setAuthError(null);

    setTimeout(() => {
      setActionSuccess(null);
    }, 6000);
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setEvents([]);
    setSelectedEvent(null);
    onClose();
  };

  // Trigger explicit confirmation before creating event
  const promptCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !startTime || !endTime) {
      setErrorMessage('Please provide a title, date, and valid times for the appointment.');
      return;
    }

    setPendingAction({
      type: 'create',
      title: 'Schedule on Google Calendar',
      description: `Create "${title}" on your Google Calendar for ${eventDate} from ${startTime} to ${endTime}?`,
    });
  };

  // Trigger explicit confirmation before deleting event
  const promptDeleteEvent = (event: CalendarEvent) => {
    setPendingAction({
      type: 'delete',
      title: 'Cancel & Delete Appointment',
      description: `Are you sure you want to remove "${event.summary}" from your Google Calendar? This action cannot be undone.`,
      data: event.id,
    });
  };

  // Execute confirmed mutating action
  const executePendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'create') {
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const startISO = new Date(`${eventDate}T${startTime}:00`).toISOString();
        const endISO = new Date(`${eventDate}T${endTime}:00`).toISOString();

        await createCalendarEvent({
          summary: title,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          startDateTime: startISO,
          endDateTime: endISO,
          attendeeEmail: attendeeEmail.trim() || undefined,
        });

        setActionSuccess('Appointment successfully scheduled on your Google Calendar.');
        setActiveTab('schedule');
        loadEvents();

        // Reset form
        setTitle('');
        setLocation('');
        setDescription('');
        setAttendeeEmail('');
        setTimeout(() => setActionSuccess(null), 5000);
      } catch (err: any) {
        console.error('Failed to create event:', err);
        setErrorMessage('Failed to schedule appointment on Google Calendar.');
      } finally {
        setIsSubmitting(false);
        setPendingAction(null);
      }
    } else if (pendingAction.type === 'delete') {
      const eventId = pendingAction.data;
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        await deleteCalendarEvent(eventId);
        setActionSuccess('Appointment deleted from Google Calendar.');
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(null);
          setActiveTab('schedule');
        }
        setTimeout(() => setActionSuccess(null), 4000);
      } catch (err: any) {
        console.error('Failed to delete event:', err);
        setErrorMessage('Failed to delete event from Google Calendar.');
      } finally {
        setIsSubmitting(false);
        setPendingAction(null);
      }
    }
  };

  const filteredEvents = useMemo(() => {
    if (filterMode === 'all') return events;
    return events.filter((e) => {
      const text = `${e.summary || ''} ${e.description || ''} ${e.location || ''}`.toLowerCase();
      return (
        text.includes('kretz') ||
        text.includes('viewing') ||
        text.includes('villa') ||
        text.includes('visite') ||
        text.includes('property') ||
        text.includes('apartment') ||
        text.includes('ref:')
      );
    });
  }, [events, filterMode]);

  const formatEventDate = (dateObj?: { dateTime?: string; date?: string }) => {
    if (!dateObj) return 'Date not specified';
    if (dateObj.dateTime) {
      const d = new Date(dateObj.dateTime);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (dateObj.date) {
      const d = new Date(dateObj.date);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden text-neutral-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center rounded-sm text-neutral-300">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-serif tracking-wide font-normal">
                  Google Calendar Concierge
                </h2>
                {hasToken && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Private viewing schedules & acquisition consultations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded-sm hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar */}
        {user && hasToken && (
          <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center space-x-2 truncate mr-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full border border-neutral-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-neutral-500" />
              )}
              <span className="font-medium text-neutral-800 truncate">
                {user.displayName || user.email}
              </span>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={loadEvents}
                disabled={isLoadingEvents}
                className="flex items-center space-x-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Refresh Calendar"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`}
                />
                <span className="text-[11px]">Sync</span>
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-neutral-500 hover:text-rose-600 transition-colors"
                title="Disconnect Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px]">Disconnect</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-500 hover:text-emerald-800 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 space-y-2 text-xs text-rose-900">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-800">
                    {authError?.title || 'Authentication Notice'}
                  </p>
                  <p className="text-rose-700 leading-relaxed font-light">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthError(null);
                }}
                className="text-rose-400 hover:text-rose-700 p-0.5 shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRedirectSignIn}
                disabled={isAuthenticating}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-medium tracking-wide uppercase transition-colors rounded-xs disabled:opacity-50"
              >
                {isAuthenticating ? 'Redirecting...' : 'Sign In with Redirect'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnauthMode('direct');
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-[11px] font-medium tracking-wide uppercase transition-colors rounded-xs"
              >
                Schedule with Concierge
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {!hasToken ? (
          <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
            {/* Unauthenticated Mode Selector */}
            <div className="border-b border-neutral-200 px-6 pt-3 flex items-center space-x-6 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setUnauthMode('google')}
                className={`pb-3 text-xs tracking-wider uppercase font-medium border-b-2 transition-colors ${
                  unauthMode === 'google'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Google Calendar Sync
              </button>
              <button
                type="button"
                onClick={() => setUnauthMode('direct')}
                className={`pb-3 text-xs tracking-wider uppercase font-medium border-b-2 transition-colors flex items-center space-x-1.5 ${
                  unauthMode === 'direct'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct Concierge Booking</span>
              </button>
            </div>

            {unauthMode === 'google' ? (
              /* Google Sync Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center mb-6 text-neutral-800">
                  <CalendarIcon className="w-8 h-8 text-neutral-700" />
                </div>
                <h3 className="text-2xl font-serif text-neutral-900 mb-2">
                  Connect Your Google Calendar
                </h3>
                <p className="text-sm text-neutral-600 max-w-sm mb-6 leading-relaxed font-sans">
                  Schedule confidential viewing appointments, coordinate private aviation or luxury transfers, and sync your acquisition calendar directly to Google Workspace.
                </p>

                {/* Primary Google Sign-in */}
                <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
                  <button
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="w-full inline-flex items-center justify-center space-x-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 px-6 py-3 rounded-xs shadow-xs transition-all text-sm font-medium hover:border-neutral-400 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>

                  {/* Fallback for Safari/Mobile/iFrames */}
                  <button
                    type="button"
                    onClick={handleRedirectSignIn}
                    disabled={isAuthenticating}
                    className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors"
                  >
                    Mobile device or popup blocked? Use redirect sign-in
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200 w-full max-w-sm flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setUnauthMode('direct')}
                    className="text-xs font-medium text-neutral-800 hover:text-neutral-950 flex items-center space-x-1.5"
                  >
                    <span>Prefer direct booking without Google account?</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[11px] text-neutral-400">
                    Direct inquiries are coordinated securely with Kretz Private Office (info@kretz.site)
                  </p>
                </div>
              </div>
            ) : (
              /* Direct Concierge Booking Form */
              <form
                onSubmit={handleDirectConciergeSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                <div className="bg-neutral-100 p-4 rounded-xs border border-neutral-200">
                  <div className="flex items-center space-x-2 text-neutral-900 font-serif text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-neutral-700" />
                    <span>Kretz Private Office Concierge</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Direct viewing and confidential appointment scheduling. Handled under non-disclosure by Kretz Real Estate France.
                  </p>
                </div>

                {/* Appointment Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                    Appointment Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'viewing', label: 'Estate Viewing' },
                      { id: 'consultation', label: 'Acquisition' },
                      { id: 'aviation', label: 'Aviation / VIP' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAppointmentType(t.id as any)}
                        className={`py-2 px-2 text-xs rounded-xs border text-center transition-all ${
                          appointmentType === t.id
                            ? 'bg-neutral-900 border-neutral-900 text-white font-medium shadow-xs'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title / Property Ref */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                    Property or Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Private Viewing: Villa Cap d'Antibes"
                    className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                  />
                </div>

                {/* Date & Preferred Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                    Location or Estate Gate
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cap d'Antibes / Cannes / Paris 16e"
                    className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                  />
                </div>

                {/* Client Contact Info */}
                <div className="space-y-3 pt-2 border-t border-neutral-200">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Lord Alexander Harrington"
                      className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={attendeeEmail}
                        onChange={(e) => setAttendeeEmail(e.target.value)}
                        placeholder="client@private.com"
                        className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                        Direct Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+33 6 ..."
                        className="w-full text-sm px-3.5 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                    Confidential Logistics & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Helipad access required, security detail escort, non-disclosure protocols..."
                    className="w-full text-sm px-3.5 py-2 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none rounded-xs resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Appointment Request</span>
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center mt-2">
                    Dispatched securely to info@kretz.site • Response within 2 hours
                  </p>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Authenticated Calendar Interface */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Navigation Tabs */}
            <div className="border-b border-neutral-200 px-6 pt-3 flex items-center justify-between bg-white">
              <div className="flex space-x-6">
                <button
                  onClick={() => {
                    setActiveTab('schedule');
                    setSelectedEvent(null);
                  }}
                  className={`pb-3 text-xs tracking-wider uppercase font-medium border-b-2 transition-colors ${
                    activeTab === 'schedule'
                      ? 'border-neutral-900 text-neutral-900 font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Schedule ({events.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setSelectedEvent(null);
                  }}
                  className={`pb-3 text-xs tracking-wider uppercase font-medium border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'create'
                      ? 'border-neutral-900 text-neutral-900 font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Book Viewing</span>
                </button>
                {selectedEvent && (
                  <button
                    onClick={() => setActiveTab('detail')}
                    className={`pb-3 text-xs tracking-wider uppercase font-medium border-b-2 transition-colors ${
                      activeTab === 'detail'
                        ? 'border-neutral-900 text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    Event Details
                  </button>
                )}
              </div>

              {activeTab === 'schedule' && (
                <div className="flex items-center space-x-2 pb-2.5">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      filterMode === 'all'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterMode('viewings')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center space-x-1 ${
                      filterMode === 'viewings'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    <span>Real Estate</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB: Schedule List */}
            {activeTab === 'schedule' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {isLoadingEvents ? (
                  <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mb-3 text-neutral-300" />
                    <span>Loading calendar appointments...</span>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-200 rounded-sm">
                    <CalendarIcon className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-700 font-medium">No upcoming appointments found</p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                      {filterMode === 'viewings'
                        ? 'No Kretz property viewings currently scheduled on your primary calendar.'
                        : 'Your Google Calendar has no upcoming events in this period.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors rounded-sm"
                    >
                      Schedule a Viewing
                    </button>
                  </div>
                ) : (
                  filteredEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setActiveTab('detail');
                      }}
                      className="group p-4 border border-neutral-200 hover:border-neutral-900 bg-white hover:shadow-xs transition-all cursor-pointer rounded-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-sm font-medium text-neutral-900 group-hover:text-neutral-950 truncate">
                            {evt.summary || 'Untitled Appointment'}
                          </h4>
                          <div className="flex items-center space-x-3 text-xs text-neutral-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{formatEventDate(evt.start)}</span>
                            </span>
                            {evt.location && (
                              <span className="flex items-center space-x-1 truncate">
                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              promptDeleteEvent(evt);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Cancel appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-700 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Book / Create Viewing Appointment */}
            {activeTab === 'create' && (
              <form
                onSubmit={promptCreateEvent}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {/* Quick Templates */}
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Quick Booking Templates
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('Private Viewing & Architectural Dossier Review');
                        setDescription(
                          'Comprehensive physical inspection with Kretz representative. Includes technical review and structural assessment.'
                        );
                      }}
                      className="text-[11px] px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-900 rounded-sm text-neutral-700 transition-colors"
                    >
                      Private Viewing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('Confidential Acquisition & Financial Due Diligence');
                        setDescription(
                          'Executive discussion regarding ownership structure (SCI / SARL), tax advisory, and offer presentation.'
                        );
                      }}
                      className="text-[11px] px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-900 rounded-sm text-neutral-700 transition-colors"
                    >
                      Acquisition Consultation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('Off-Market Portfolio Presentation (Paris & Côte d\'Azur)');
                        setDescription(
                          'Private briefing on unpublished ultra-luxury estates and private islands.'
                        );
                      }}
                      className="text-[11px] px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-900 rounded-sm text-neutral-700 transition-colors"
                    >
                      Off-Market Briefing
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Appointment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Private Viewing: Villa Semaphore"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Location / Meeting Point
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 15 Rue de Passy, 75016 Paris / Estate Security Gate"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Attendee / Agent Email
                  </label>
                  <input
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="info@kretz.site"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Appointment Notes & Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide special access requirements, security clearances, or specific focus areas..."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 font-sans"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs tracking-wider uppercase font-medium rounded-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    Confirm & Schedule on Google Calendar
                  </button>
                </div>
              </form>
            )}

            {/* TAB: Event Detail View */}
            {activeTab === 'detail' && selectedEvent && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to schedule</span>
                </button>

                <div className="space-y-3 pb-6 border-b border-neutral-200">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-serif text-neutral-900">
                      {selectedEvent.summary || 'Untitled Event'}
                    </h3>
                    <button
                      onClick={() => promptDeleteEvent(selectedEvent)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete from Google Calendar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{formatEventDate(selectedEvent.start)}</span>
                      {selectedEvent.end?.dateTime && (
                        <span>
                          —{' '}
                          {new Date(selectedEvent.end.dateTime).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    {selectedEvent.location && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}

                    {selectedEvent.htmlLink && (
                      <div className="pt-2">
                        <a
                          href={selectedEvent.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-neutral-900 hover:underline font-medium"
                        >
                          <span>Open in Google Calendar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      Attendees ({selectedEvent.attendees.length})
                    </span>
                    <div className="space-y-1">
                      {selectedEvent.attendees.map((att, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-neutral-600 flex items-center space-x-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{att.displayName || att.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      Dossier & Notes
                    </span>
                    <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE / MUTATING OPERATIONS */}
        {pendingAction && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white max-w-sm w-full p-6 rounded-sm shadow-2xl space-y-4 border border-neutral-200">
              <div className="flex items-center space-x-3 text-neutral-900">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    pendingAction.type === 'delete'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  {pendingAction.type === 'delete' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : (
                    <CalendarIcon className="w-5 h-5" />
                  )}
                </div>
                <h4 className="text-base font-serif font-medium leading-snug">
                  {pendingAction.title}
                </h4>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {pendingAction.description}
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPendingAction(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs tracking-wider uppercase rounded-sm hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={executePendingAction}
                  className={`px-4 py-2 text-white text-xs tracking-wider uppercase rounded-sm font-medium transition-colors ${
                    pendingAction.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-neutral-900 hover:bg-neutral-800'
                  }`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : pendingAction.type === 'delete'
                    ? 'Delete Event'
                    : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
