import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Mail,
  Bell,
  RefreshCw,
  Clock,
  Calendar,
  Trash2,
  ExternalLink,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  Filter,
  UserCheck,
  Camera,
  Upload,
  FolderUp,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { Property } from '../types';
import rawPropertiesData from '../data/properties.json';
import { enrichPropertiesWithOwners } from '../data/ownersRegistry';
import {
  saveOwnerPhoto,
  deleteOwnerPhoto,
  bulkUploadOwnerPhotos,
  subscribeOwnerPhotos,
} from '../services/ownerPhotosService';
import { getIdToken } from '../services/firebaseAuth';
import { defaultFamilyMembers, FamilyMember } from './FamilyDirectory';

interface PressPhotoItem {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
  fallback: string;
  description: string;
}

const editorialPressPhotos: PressPhotoItem[] = [
  {
    id: 'cover',
    title: "Couverture Officielle L'Agence",
    subtitle: "Olivier, Sandrine, Majo, Valentin, Martin, Louis & Raphaël dans leur salon parisien",
    filename: 'IMG_6413.jpeg',
    fallback: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    description: "Édition Collector N° 04 • TMC & Netflix (IMG_6413.jpeg)",
  },
  {
    id: 'estate',
    title: "Série Manoir Historique de Normandie",
    subtitle: "Olivier, Martin, Valentin & Raphaël Kretz devant le manoir anglo-normand",
    filename: 'IMG_6412.jpeg',
    fallback: 'https://images.unsplash.com/photo-1542314831-c6a4d27f3299?auto=format&fit=crop&w=1200&q=85',
    description: "Photographie de tournage patrimonial (IMG_6412.jpeg)",
  },
];

interface Inquiry {
  id: number;
  userUid: string | null;
  propertyRef: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  message: string;
  status: 'pending' | 'contacted' | 'viewing_scheduled' | 'closed';
  createdAt: string;
}

interface SearchAlert {
  id: number;
  userUid: string | null;
  email: string;
  destination: string | null;
  propertyType: string | null;
  budgetMax: number | null;
  createdAt: string;
}

interface ClientUser {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  createdAt: string;
}

interface AdminMetrics {
  totalInquiries: number;
  pendingInquiries: number;
  contactedInquiries: number;
  scheduledInquiries: number;
  totalAlerts: number;
  totalClients: number;
  totalFavorites: number;
}

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onOpenGmailForInquiry?: (email: string, subject: string, body: string) => void;
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  initialTab?: 'inquiries' | 'alerts' | 'clients' | 'owners' | 'family';
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
  onOpenGmailForInquiry,
  properties,
  onSelectProperty,
  initialTab = 'inquiries',
}) => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'alerts' | 'clients' | 'owners' | 'family'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [ownerPhotosMap, setOwnerPhotosMap] = useState<Record<string, string>>({});
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const individualInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Family & Press Photos State (moved from FamilyDirectory and FamilyMagazineSpread)
  const [familyPhotoMap, setFamilyPhotoMap] = useState<Record<string, string>>({});
  const [pressPhotoMap, setPressPhotoMap] = useState<Record<string, string>>({});
  const [isFamilyBulkUploading, setIsFamilyBulkUploading] = useState(false);
  const [familyBulkFeedback, setFamilyBulkFeedback] = useState<string | null>(null);
  const familyBulkInputRef = useRef<HTMLInputElement>(null);
  const memberFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pressFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);

  // Subscribe to owner photos
  useEffect(() => {
    const unsub = subscribeOwnerPhotos((photos) => {
      setOwnerPhotosMap(photos);
    });
    return unsub;
  }, []);

  // Synchronize family and press photos
  const loadFamilyAndPressPhotos = useCallback(() => {
    const loadedMembers: Record<string, string> = {};
    defaultFamilyMembers.forEach((m) => {
      const saved =
        localStorage.getItem(`kretz_photo_${m.photoFilename}`) ||
        localStorage.getItem(`kretz_member_photo_${m.id}`);
      if (saved) {
        loadedMembers[m.id] = saved;
      }
    });

    const loadedPress: Record<string, string> = {};
    editorialPressPhotos.forEach((item) => {
      const saved = localStorage.getItem(`kretz_photo_${item.filename}`);
      if (saved) {
        loadedPress[item.id] = saved;
      }
    });

    setFamilyPhotoMap(loadedMembers);
    setPressPhotoMap(loadedPress);

    // Also check server filesystem for real uploaded photos
    fetch('/api/family-photos')
      .then((res) => res.json())
      .then((data) => {
        if (data?.photos && Array.isArray(data.photos)) {
          const serverPhotos = data.photos as string[];
          defaultFamilyMembers.forEach((m) => {
            if (serverPhotos.includes(m.photoFilename) && !loadedMembers[m.id]) {
              loadedMembers[m.id] = `/${m.photoFilename}`;
            }
          });
          editorialPressPhotos.forEach((item) => {
            if (serverPhotos.includes(item.filename) && !loadedPress[item.id]) {
              loadedPress[item.id] = `/${item.filename}`;
            }
          });
          setFamilyPhotoMap({ ...loadedMembers });
          setPressPhotoMap({ ...loadedPress });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFamilyAndPressPhotos();
    const handleUpdate = () => loadFamilyAndPressPhotos();
    window.addEventListener('kretz_family_photos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kretz_family_photos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFamilyAndPressPhotos]);

  const familyRealPhotoCount = useMemo(() => {
    return Object.keys(familyPhotoMap).length + Object.keys(pressPhotoMap).length;
  }, [familyPhotoMap, pressPhotoMap]);

  const portfolioProperties = useMemo(() => {
    if (properties && properties.length > 0) return properties;
    const qualified = (rawPropertiesData as Property[]).filter(
      (p) => (p.price ?? 0) >= 4500000
    );
    return enrichPropertiesWithOwners(qualified);
  }, [properties]);

  // Filtered owners list
  const filteredOwnersList = useMemo(() => {
    return portfolioProperties.filter((p) => {
      const owner = p.owner;
      const ref = p.ref.toLowerCase();
      const title = p.title.toLowerCase();
      const ownerName = owner?.name?.toLowerCase() || '';
      const category = owner?.category || '';
      const location = p.location?.toLowerCase() || '';

      const query = ownerSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ref.includes(query) ||
        title.includes(query) ||
        ownerName.includes(query) ||
        category.toLowerCase().includes(query) ||
        location.includes(query);

      if (!matchesSearch) return false;

      const hasPhoto = Boolean(ownerPhotosMap[p.ref] || (owner?.name && ownerPhotosMap[owner.name]));
      if (ownerFilter === 'with-photo') return hasPhoto;
      if (ownerFilter === 'without-photo') return !hasPhoto;
      if (ownerFilter !== 'all') return category === ownerFilter;
      return true;
    });
  }, [portfolioProperties, ownerSearch, ownerFilter, ownerPhotosMap]);

  const ownerPhotosCount = useMemo(() => {
    return portfolioProperties.filter((p) => {
      const owner = p.owner;
      return Boolean(ownerPhotosMap[p.ref] || (owner?.name && ownerPhotosMap[owner.name]));
    }).length;
  }, [portfolioProperties, ownerPhotosMap]);

  // Individual owner photo upload
  const handleOwnerPhotoUpload = (
    propertyRef: string,
    ownerName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await saveOwnerPhoto(propertyRef, ownerName, dataUrl, file.name);
      setActionSuccessMessage(`Photo enregistrée pour le propriétaire de ${propertyRef}.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  // Delete owner photo
  const handleOwnerPhotoDelete = async (propertyRef: string, ownerName: string) => {
    if (!window.confirm(`Supprimer la photo du propriétaire pour ${propertyRef} ?`)) return;
    await deleteOwnerPhoto(propertyRef, ownerName);
    setActionSuccessMessage(`Photo supprimée pour ${propertyRef}.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // Bulk upload owner photos
  const handleBulkOwnerPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBulkUploading(true);
    try {
      const res = await bulkUploadOwnerPhotos(
        files,
        portfolioProperties.map((p) => ({
          ref: p.ref,
          title: p.title,
          owner: p.owner ? { name: p.owner.name } : undefined,
        }))
      );
      if (res.matchedCount > 0) {
        setActionSuccessMessage(`${res.matchedCount} photo(s) de propriétaires importée(s) avec succès !`);
      } else {
        setErrorMessage('Aucune correspondance automatique. Nommez vos fichiers avec la référence (ex: KP1-173.jpg) ou le nom du propriétaire.');
      }
      setTimeout(() => {
        setActionSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
    } catch {
      setErrorMessage('Erreur lors du téléversement en masse');
    } finally {
      setIsBulkUploading(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
    }
  };

  // Family & Press Photo Handlers (moved to Admin Panel)
  const saveFamilyOrPressPhoto = async (
    filename: string,
    dataUrl: string,
    memberId?: string,
    pressId?: string
  ) => {
    localStorage.setItem(`kretz_photo_${filename}`, dataUrl);
    if (memberId) {
      localStorage.setItem(`kretz_member_photo_${memberId}`, dataUrl);
      setFamilyPhotoMap((prev) => ({ ...prev, [memberId]: dataUrl }));
    }
    if (pressId) {
      setPressPhotoMap((prev) => ({ ...prev, [pressId]: dataUrl }));
    }

    // Broadcast change immediately across components
    window.dispatchEvent(new CustomEvent('kretz_family_photos_updated'));

    try {
      await fetch('/api/upload-family-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, data: dataUrl }),
      });
      setFamilyBulkFeedback(`Photo ${filename} enregistrée avec succès.`);
      setTimeout(() => setFamilyBulkFeedback(null), 4000);
    } catch (err) {
      console.warn('Saved photo to client cache:', err);
    }
  };

  const handleMemberPhotoUpload = (
    member: FamilyMember,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await saveFamilyOrPressPhoto(member.photoFilename, dataUrl, member.id, undefined);
    };
    reader.readAsDataURL(file);
  };

  const handlePressPhotoUpload = (
    item: PressPhotoItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await saveFamilyOrPressPhoto(item.filename, dataUrl, undefined, item.id);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFamilyPhoto = (member: FamilyMember) => {
    if (!window.confirm(`Réinitialiser la photo de ${member.name} ?`)) return;
    localStorage.removeItem(`kretz_photo_${member.photoFilename}`);
    localStorage.removeItem(`kretz_member_photo_${member.id}`);
    setFamilyPhotoMap((prev) => {
      const next = { ...prev };
      delete next[member.id];
      return next;
    });
    window.dispatchEvent(new CustomEvent('kretz_family_photos_updated'));
    setFamilyBulkFeedback(`Photo réinitialisée pour ${member.name}.`);
    setTimeout(() => setFamilyBulkFeedback(null), 3000);
  };

  const handleRemovePressPhoto = (item: PressPhotoItem) => {
    if (!window.confirm(`Réinitialiser la photo pour ${item.title} ?`)) return;
    localStorage.removeItem(`kretz_photo_${item.filename}`);
    setPressPhotoMap((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    window.dispatchEvent(new CustomEvent('kretz_family_photos_updated'));
    setFamilyBulkFeedback(`Photo réinitialisée pour ${item.title}.`);
    setTimeout(() => setFamilyBulkFeedback(null), 3000);
  };

  const handleFamilyBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsFamilyBulkUploading(true);
    let matchedCount = 0;
    const newMemberPhotos = { ...familyPhotoMap };
    const newPressPhotos = { ...pressPhotoMap };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name.trim();

      let targetMemberId: string | null = null;
      let targetPressId: string | null = null;
      let safeFilename = filename;

      if (/6408/i.test(filename) || /olivier/i.test(filename)) {
        targetMemberId = 'olivier';
        safeFilename = 'IMG_6408.jpeg';
      } else if (/6409/i.test(filename) || /valentin/i.test(filename)) {
        targetMemberId = 'valentin';
        safeFilename = 'IMG_6409.jpeg';
      } else if (/6410/i.test(filename) || /martin/i.test(filename)) {
        targetMemberId = 'martin';
        safeFilename = 'IMG_6410.jpeg';
      } else if (/6411/i.test(filename) || /raphael/i.test(filename) || /raphaël/i.test(filename)) {
        targetMemberId = 'raphael';
        safeFilename = 'IMG_6411.jpeg';
      } else if (/6407/i.test(filename) || /sandrine/i.test(filename)) {
        targetMemberId = 'sandrine';
        safeFilename = 'IMG_6407.jpeg';
      } else if (/louis/i.test(filename)) {
        targetMemberId = 'louis';
        safeFilename = 'louis_kretz.jpeg';
      } else if (/charline/i.test(filename)) {
        targetMemberId = 'charline';
        safeFilename = 'charline_dray.jpeg';
      } else if (/6413/i.test(filename)) {
        targetPressId = 'cover';
        safeFilename = 'IMG_6413.jpeg';
      } else if (/6412/i.test(filename)) {
        targetPressId = 'estate';
        safeFilename = 'IMG_6412.jpeg';
      }

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });

      localStorage.setItem(`kretz_photo_${safeFilename}`, dataUrl);

      if (targetMemberId) {
        newMemberPhotos[targetMemberId] = dataUrl;
        localStorage.setItem(`kretz_member_photo_${targetMemberId}`, dataUrl);
        matchedCount++;
      }
      if (targetPressId) {
        newPressPhotos[targetPressId] = dataUrl;
        matchedCount++;
      }

      try {
        await fetch('/api/upload-family-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: safeFilename, data: dataUrl }),
        });
      } catch (err) {
        console.warn(`Failed to upload ${safeFilename} to server:`, err);
      }
    }

    setFamilyPhotoMap(newMemberPhotos);
    setPressPhotoMap(newPressPhotos);
    setIsFamilyBulkUploading(false);
    window.dispatchEvent(new CustomEvent('kretz_family_photos_updated'));
    setFamilyBulkFeedback(
      `Synchronisation terminée : ${files.length} photo(s) importée(s) (${matchedCount} associée(s)).`
    );
    if (familyBulkInputRef.current) familyBulkInputRef.current.value = '';
    setTimeout(() => setFamilyBulkFeedback(null), 5000);
  };

  // Fetch admin data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication token required. Please ensure you are signed in.');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [metricsRes, inquiriesRes, alertsRes, usersRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/inquiries', { headers }),
        fetch('/api/admin/alerts', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (!inquiriesRes.ok || !metricsRes.ok) {
        if (inquiriesRes.status === 403 || metricsRes.status === 403) {
          throw new Error('Access denied: Administrator privileges required for this portal.');
        }
        throw new Error('Failed to load administrator records from server.');
      }

      const metricsData = await metricsRes.json();
      const inquiriesData = await inquiriesRes.json();
      const alertsData = alertsRes.ok ? await alertsRes.json() : { alerts: [] };
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

      setMetrics(metricsData.metrics || null);
      setInquiries(inquiriesData.inquiries || []);
      setAlerts(alertsData.alerts || []);
      setClients(usersData.users || []);
    } catch (err: any) {
      console.error('AdminPortal fetch failed:', err);
      setErrorMessage(err.message || 'Error connecting to database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  // Handle status update
  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiryId ? { ...item, status: newStatus as any } : item
        )
      );

      setActionSuccessMessage(`Inquiry #${inquiryId} marked as ${newStatus.replace('_', ' ')}.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);

      // Refresh metrics
      fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setMetrics(d.metrics))
        .catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not update status');
    }
  };

  // Handle delete inquiry
  const handleDeleteInquiry = async (inquiryId: number) => {
    if (!window.confirm('Are you sure you want to delete this client inquiry?')) return;
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete inquiry');

      setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
      setActionSuccessMessage(`Inquiry #${inquiryId} deleted.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not delete inquiry');
    }
  };

  if (!isOpen) return null;

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-900 border border-blue-300">
            <Mail className="w-3 h-3 mr-1" /> Contacted
          </span>
        );
      case 'viewing_scheduled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-900 border border-purple-300">
            <Calendar className="w-3 h-3 mr-1" /> Viewing Scheduled
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      id="admin-portal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-md shadow-2xl flex flex-col overflow-hidden border border-neutral-200 text-[#1d1d1b]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#fae9e5]/20 flex items-center justify-center text-[#fae9e5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-serif font-bold tracking-wide">
                  KRETZ Properties Administration
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications Bar */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-6 py-2.5 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 text-rose-800 border-b border-rose-200 px-6 py-2.5 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Overview Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-6 py-4 bg-neutral-50 border-b border-neutral-200 text-center">
            <div className="bg-white p-3 rounded border border-neutral-200">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Total Inquiries
              </p>
              <p className="text-xl font-bold font-serif text-[#1d1d1b] mt-0.5">
                {metrics.totalInquiries}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-amber-200">
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">
                Pending Action
              </p>
              <p className="text-xl font-bold font-serif text-amber-800 mt-0.5">
                {metrics.pendingInquiries}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">
                Contacted
              </p>
              <p className="text-xl font-bold font-serif text-blue-800 mt-0.5">
                {metrics.contactedInquiries}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">
                Viewings
              </p>
              <p className="text-xl font-bold font-serif text-purple-800 mt-0.5">
                {metrics.scheduledInquiries}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-neutral-200">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Portfolio Alerts
              </p>
              <p className="text-xl font-bold font-serif text-[#1d1d1b] mt-0.5">
                {metrics.totalAlerts}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-neutral-200">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                Saved Properties
              </p>
              <p className="text-xl font-bold font-serif text-[#1d1d1b] mt-0.5">
                {metrics.totalFavorites}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6 bg-white justify-between items-center">
          <div className="flex space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'inquiries'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Inquiries & Leads ({inquiries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'alerts'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Buyer Alerts ({alerts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'clients'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Registered Clients ({clients.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('owners')}
              className={`py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'owners'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Propriétaires & Photos ({portfolioProperties.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('family')}
              className={`py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'family'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Photos Famille & Presse ({familyRealPhotoCount})</span>
            </button>
          </div>

          {/* Controls for family photos */}
          {activeTab === 'family' && (
            <div className="flex items-center space-x-2 py-2">
              <button
                type="button"
                onClick={() => familyBulkInputRef.current?.click()}
                disabled={isFamilyBulkUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-semibold uppercase tracking-wider rounded cursor-pointer hover:bg-neutral-800 transition"
              >
                <FolderUp className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFamilyBulkUploading ? 'Import en cours...' : 'Import Photos Réelles'}</span>
              </button>
              <input
                ref={familyBulkInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFamilyBulkUpload}
              />
            </div>
          )}

          {/* Controls for owners */}
          {activeTab === 'owners' && (
            <div className="flex items-center space-x-2 py-2">
              <button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={isBulkUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-semibold uppercase tracking-wider rounded cursor-pointer hover:bg-neutral-800 transition"
              >
                <FolderUp className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBulkUploading ? 'Import...' : 'Import Photos en Masse'}</span>
              </button>
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleBulkOwnerPhotos}
              />
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value as any)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-[#1d1d1b] focus:outline-none focus:border-black"
              >
                <option value="all">Tous ({portfolioProperties.length})</option>
                <option value="with-photo">Avec photo ({ownerPhotosCount})</option>
                <option value="without-photo">Sans photo ({portfolioProperties.length - ownerPhotosCount})</option>
              </select>
            </div>
          )}

          {/* Filter for inquiries */}
          {activeTab === 'inquiries' && (
            <div className="flex items-center space-x-2 py-2">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-[#1d1d1b] focus:outline-none focus:border-black"
              >
                <option value="all">All Statuses ({inquiries.length})</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
          {isLoading && inquiries.length === 0 ? (
            <div className="py-20 text-center text-neutral-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">Loading administrator records from database...</p>
            </div>
          ) : activeTab === 'inquiries' ? (
            /* Inquiries List View */
            filteredInquiries.length === 0 ? (
              <div className="py-16 text-center bg-white rounded border border-neutral-200">
                <Mail className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-600">No client inquiries found</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {statusFilter !== 'all'
                    ? 'Try changing the status filter above.'
                    : 'Client inquiry messages submitted through property cards will display here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded border border-neutral-200 p-5 shadow-sm hover:border-neutral-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <span className="font-semibold text-sm text-[#1d1d1b]">
                            {inq.senderName}
                          </span>
                          <span className="text-xs text-neutral-400">|</span>
                          <span className="font-mono text-xs text-neutral-600">
                            {inq.senderEmail}
                          </span>
                          {inq.senderPhone && (
                            <>
                              <span className="text-xs text-neutral-400">|</span>
                              <span className="inline-flex items-center text-xs text-neutral-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {inq.senderPhone}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1 flex items-center space-x-2">
                          <span className="font-semibold text-neutral-700">Property:</span>
                          <span className="underline font-mono">Ref: {inq.propertyRef}</span>
                          <span>—</span>
                          <span className="truncate max-w-md">{inq.propertyTitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {getStatusBadge(inq.status)}
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className="text-xs bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded px-2 py-1 text-neutral-800 font-medium focus:outline-none"
                        >
                          <option value="pending">Mark Pending</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="viewing_scheduled">Mark Viewing Scheduled</option>
                          <option value="closed">Mark Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Inquiry Message Body */}
                    <div className="py-3 text-xs text-neutral-700 bg-neutral-50/70 p-3 rounded my-3 border border-neutral-100 font-sans leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                      <span>
                        Received: {new Date(inq.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-3">
                        {onOpenGmailForInquiry ? (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenGmailForInquiry(
                                inq.senderEmail,
                                `Re: KRETZ Inquiry - Ref ${inq.propertyRef} (${inq.propertyTitle})`,
                                `Dear ${inq.senderName},\n\nThank you for contacting KRETZ regarding ${inq.propertyTitle} (Ref: ${inq.propertyRef}).\n\n`
                              )
                            }
                            className="inline-flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-semibold"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Reply via Concierge</span>
                          </button>
                        ) : (
                          <a
                            href={`mailto:${inq.senderEmail}?subject=${encodeURIComponent(
                              `Re: KRETZ Inquiry Ref ${inq.propertyRef}`
                            )}`}
                            className="inline-flex items-center space-x-1 text-neutral-700 hover:text-black font-semibold"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email Client</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-800"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'alerts' ? (
            /* Buyer Alerts List View */
            alerts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded border border-neutral-200">
                <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-600">No registered buyer alerts</p>
                <p className="text-xs text-neutral-400 mt-1">
                  VIP search alerts created via the header or modal will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded border border-neutral-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Subscriber</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Property Type</th>
                      <th className="px-4 py-3">Max Budget</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {alerts.map((a) => (
                      <tr key={a.id} className="hover:bg-neutral-50/60">
                        <td className="px-4 py-3 font-medium text-[#1d1d1b]">
                          {a.email}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {a.destination || 'All Destinations'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 capitalize">
                          {a.propertyType || 'All Types'}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-700">
                          {a.budgetMax ? `€${a.budgetMax.toLocaleString()}` : 'Unspecified'}
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'clients' ? (
            /* Registered Clients List View */
            clients.length === 0 ? (
              <div className="py-16 text-center bg-white rounded border border-neutral-200">
                <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-600">No client accounts recorded yet</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Users who sign in via Google Auth sync automatically with the Cloud SQL database.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded border border-neutral-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">UID</th>
                      <th className="px-4 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {clients.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50/60">
                        <td className="px-4 py-3 font-medium text-[#1d1d1b] flex items-center space-x-2">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt=""
                              className="w-6 h-6 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                              {user.name ? user.name[0] : user.email[0]}
                            </div>
                          )}
                          <span>{user.name || 'Unnamed Client'}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 font-mono">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-neutral-400 font-mono text-[10px]">
                          {user.uid.slice(0, 14)}...
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'owners' ? (
            /* Owners & Real Photos Management View (from IMG_6453.jpeg) */
            <div className="space-y-6">
              {/* Header Banner - Dark Theme with REAL OWNERS PROVENANCE Pill */}
              <div className="p-5 sm:p-6 bg-[#121212] text-white rounded-none border border-neutral-800 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-sm bg-neutral-800/90 border border-neutral-700 flex items-center justify-center shrink-0 text-amber-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 bg-[#064e3b] text-[#34d399] border border-[#047857] text-[10px] font-bold tracking-widest rounded-full uppercase inline-block">
                          REAL OWNERS PROVENANCE
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-medium tracking-wide text-white mt-2">
                        Gestionnaire des Photos des Propriétaires
                      </h3>
                      <p className="text-xs text-neutral-300 font-light mt-1 max-w-2xl leading-relaxed">
                        Uploadez et gérez les photos de profil réelles des propriétaires de chaque bien du portefeuille.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActionSuccessMessage('Synchronisation des profils et photos en cours...');
                      setTimeout(() => setActionSuccessMessage(null), 3000);
                    }}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition cursor-pointer shrink-0"
                    title="Actualiser la liste"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statistics & Mass Upload Banner */}
              <div className="bg-white p-5 border border-neutral-200 shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    TOTAL PROPRIÉTÉS / MANDATS
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-medium text-[#1d1d1b]">
                    {portfolioProperties.length}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#065f46] font-semibold block">
                    PHOTOS RÉELLES ACTIVES
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl text-[#065f46] font-medium">
                      {ownerPhotosCount}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      ({Math.round((ownerPhotosCount / (portfolioProperties.length || 1)) * 100)}% couvert)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => bulkFileInputRef.current?.click()}
                  disabled={isBulkUploading}
                  className="w-full py-3.5 px-4 bg-[#1d1d1b] hover:bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm rounded-none border border-neutral-800 transition cursor-pointer"
                >
                  <FolderUp className="w-4 h-4 text-amber-300" />
                  <span>{isBulkUploading ? 'Import en cours...' : 'IMPORTER DES PHOTOS EN MASSE'}</span>
                </button>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleBulkOwnerPhotos}
                />
              </div>

              {/* Search and Filters Bar */}
              <div className="bg-white p-4 border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par référence, titre, nom du propriétaire..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-none text-[#1d1d1b] focus:outline-none focus:border-black"
                  />
                  {ownerSearch && (
                    <button
                      type="button"
                      onClick={() => setOwnerSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400 shrink-0 hidden sm:block" />
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-200 rounded-none px-3 py-2 text-[#1d1d1b] focus:outline-none focus:border-black cursor-pointer w-full sm:w-auto"
                  >
                    <option value="all">Tous les propriétaires ({portfolioProperties.length})</option>
                    <option value="with-photo">Avec photo ({ownerPhotosCount})</option>
                    <option value="without-photo">Sans photo ({portfolioProperties.length - ownerPhotosCount})</option>
                    <option value="Aristocracy & Royalty">Aristocracy & Royalty</option>
                    <option value="Grand Cru Wine Estate">Grand Cru Wine Estate</option>
                    <option value="Haute Couture & Luxury">Haute Couture & Luxury</option>
                    <option value="Industrialists & Tech Pioneers">Industrialists & Tech Pioneers</option>
                    <option value="Private Family Office">Private Family Office</option>
                    <option value="Contemporary Art Collector">Contemporary Art Collector</option>
                  </select>
                </div>
              </div>

              {/* Owner List Cards */}
              {filteredOwnersList.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-none border border-neutral-200">
                  <UserCheck className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">Aucun propriétaire trouvé</p>
                  <p className="text-xs text-neutral-400 mt-1">Essayez de modifier votre recherche ou le filtre sélectionné.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOwnersList.map((property) => {
                    const owner = property.owner || {
                      name: 'Propriétaire Privé',
                      category: 'Industrialists & Tech Pioneers' as any,
                      ownershipType: 'Current Propriétaire' as any,
                      bio: 'Mandat confidentiel de vente',
                      avatarInitials: 'PR',
                    };

                    const currentPhoto =
                      ownerPhotosMap[property.ref] ||
                      (owner.name ? ownerPhotosMap[owner.name] : null) ||
                      owner.photo;

                    const hasActivePhoto = Boolean(currentPhoto);

                    return (
                      <div
                        key={property.id || property.ref}
                        className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-all"
                      >
                        {/* Card Top Row: Ref Badge & Location */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 mb-3">
                          <span className="font-mono text-[11px] font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-sm">
                            {property.ref}
                          </span>
                          <span className="text-[11px] text-neutral-500 truncate max-w-[240px]">
                            {property.location || 'France & International'}
                          </span>
                        </div>

                        {/* Main Body */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Avatar with Camera Overlay */}
                            <div className="relative shrink-0">
                              {currentPhoto ? (
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xs relative group">
                                  <img
                                    src={currentPhoto}
                                    alt={owner.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => individualInputsRef.current[property.ref]?.click()}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-[10px]"
                                    title="Remplacer la photo"
                                  >
                                    <Camera className="w-4 h-4 text-amber-300" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-[#1d1d1b] text-amber-300 border-2 border-neutral-800 flex items-center justify-center font-serif text-lg font-normal shadow-xs relative group">
                                  <span>{owner.avatarInitials || 'KR'}</span>
                                  <button
                                    type="button"
                                    onClick={() => individualInputsRef.current[property.ref]?.click()}
                                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer rounded-full"
                                    title="Ajouter une photo"
                                  >
                                    <Upload className="w-4 h-4 text-amber-300" />
                                  </button>
                                </div>
                              )}

                              {/* Camera icon badge in corner */}
                              <button
                                type="button"
                                onClick={() => individualInputsRef.current[property.ref]?.click()}
                                className="absolute -bottom-1 -right-1 p-1 bg-[#1d1d1b] text-amber-300 rounded-full border border-neutral-300 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                                title="Changer la photo"
                              >
                                <Camera className="w-3 h-3" />
                              </button>

                              <input
                                ref={(el) => {
                                  individualInputsRef.current[property.ref] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleOwnerPhotoUpload(property.ref, owner.name, e)
                                }
                              />
                            </div>

                            {/* Owner Details */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <h4 className="font-serif font-medium text-base text-[#1d1d1b] leading-tight truncate">
                                {owner.name}
                              </h4>
                              <p className="text-xs text-neutral-500 font-light truncate">
                                {property.title}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-medium">
                                  {owner.category}
                                </span>

                                {hasActivePhoto ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-semibold">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Photo Active</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 border border-amber-300 bg-amber-50/50 text-amber-800 text-[10px] font-semibold">
                                    Sans photo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions on the Right */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => individualInputsRef.current[property.ref]?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-medium transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-neutral-700" />
                              <span>{hasActivePhoto ? 'Remplacer' : 'Uploader'}</span>
                            </button>

                            {hasActivePhoto && (
                              <button
                                type="button"
                                onClick={() => handleOwnerPhotoDelete(property.ref, owner.name)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 transition cursor-pointer border border-transparent hover:border-neutral-200 rounded-sm"
                                title="Supprimer la photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {onSelectProperty && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectProperty(property);
                                  onClose();
                                }}
                                className="p-1.5 text-neutral-400 hover:text-black transition cursor-pointer border border-transparent hover:border-neutral-200 rounded-sm"
                                title="Voir la fiche du bien"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer info text */}
              <div className="text-center text-xs text-neutral-400 pt-2">
                {filteredOwnersList.length} propriétaire(s) affiché(s) • Les photos sont synchronisées en temps réel et stockées de manière sécurisée.
              </div>
            </div>
          ) : activeTab === 'family' ? (
            /* Tab 5: Family & Press Photos Management */
            <div className="space-y-8">
              {/* Feedback Alert */}
              {familyBulkFeedback && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center justify-between text-sm shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{familyBulkFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFamilyBulkFeedback(null)}
                    className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* Feature 3: Real Photos Manager Header & Bulk Upload (from IMG_6426.jpeg) */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-[#1d1d1b] to-neutral-900 text-white rounded-xl shadow-lg border border-neutral-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-amber-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-serif font-medium tracking-wide text-white">
                          Gestionnaire de Photos Réelles de la Famille
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          <span>{familyRealPhotoCount} active(s)</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-300 font-light mt-1 max-w-2xl leading-relaxed">
                        Importez directement vos photos réelles (IMG_6408, IMG_6409, IMG_6410, IMG_6411, IMG_6407, IMG_6412, IMG_6413).
                        Elles sont automatiquement associées par reconnaissance de nom et synchronisées instantanément sur la page famille et le magazine.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => familyBulkInputRef.current?.click()}
                      disabled={isFamilyBulkUploading}
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                    >
                      <Upload className="w-4 h-4 text-neutral-900" />
                      <span>{isFamilyBulkUploading ? 'Import en cours...' : 'Importer les photos réelles'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature 1: Family Members Official Portraits (from IMG_6428.jpeg) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Portraits des Associés & Fondateurs</span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Contrôle individuel des photos de profil officielles affichées dans l'annuaire de la famille.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-neutral-500">
                    {defaultFamilyMembers.length} membres
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {defaultFamilyMembers.map((member) => {
                    const customPhoto = familyPhotoMap[member.id];
                    const photoSrc = customPhoto || `/${member.photoFilename}`;
                    const hasCustomPhoto = Boolean(customPhoto);

                    return (
                      <div
                        key={member.id}
                        className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                      >
                        {/* Member Photo Box */}
                        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden group">
                          {photoSrc ? (
                            <img
                              src={photoSrc}
                              alt={member.name}
                              className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-serif text-neutral-400 bg-neutral-200">
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                          )}

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                          {/* Top-right Badges & Camera Trigger (as seen in IMG_6428.jpeg) */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                            {hasCustomPhoto && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                                <CheckCircle className="w-3 h-3" />
                                <span>Photo Réelle</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => memberFileInputRefs.current[member.id]?.click()}
                              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#1d1d1b] flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer"
                              title={`Changer la photo de ${member.name}`}
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Hidden File Input */}
                          <input
                            ref={(el) => {
                              memberFileInputRefs.current[member.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleMemberPhotoUpload(member, e)}
                          />

                          {/* Member Role Overlay */}
                          <div className="absolute bottom-2 left-2.5 right-2.5 text-white z-10">
                            <p className="text-xs font-semibold leading-tight drop-shadow-sm">{member.name}</p>
                            <p className="text-[10px] text-neutral-300 font-light truncate drop-shadow-sm">{member.role}</p>
                          </div>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex flex-col justify-between flex-1 gap-2.5">
                          <div className="text-[11px] text-neutral-500 font-mono">
                            Fichier : <span className="text-neutral-700 font-semibold">{member.photoFilename}</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => memberFileInputRefs.current[member.id]?.click()}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-neutral-100 text-[#1d1d1b] border border-neutral-300 rounded text-[11px] font-semibold uppercase tracking-wider transition cursor-pointer"
                            >
                              <Camera className="w-3 h-3 text-neutral-600" />
                              <span>{hasCustomPhoto ? 'Remplacer' : 'Ajouter'}</span>
                            </button>
                            {hasCustomPhoto && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFamilyPhoto(member)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 rounded transition cursor-pointer"
                                title="Réinitialiser la photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature 2: Magazine & Editorial Press Spreads (from IMG_6427.jpeg) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>Photographies Presse & Édition Collector (L'Agence Magazine)</span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Gestion des deux photographies maîtresses affichées sur la couverture du magazine (IMG_6413 et IMG_6412).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editorialPressPhotos.map((item) => {
                    const customPhoto = pressPhotoMap[item.id];
                    const photoSrc = customPhoto || item.fallback;
                    const hasCustomPhoto = Boolean(customPhoto);

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                      >
                        {/* Cover Image Box */}
                        <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden group">
                          <img
                            src={photoSrc}
                            alt={item.title}
                            className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                          {/* Top-right real photo badge */}
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                            {hasCustomPhoto && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                                <CheckCircle className="w-3 h-3" />
                                <span>Photo Réelle</span>
                              </span>
                            )}
                          </div>

                          {/* Bottom info banner */}
                          <div className="absolute bottom-3 left-4 right-4 text-white z-10">
                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-300">
                              Fichier : {item.filename}
                            </p>
                            <h5 className="text-sm font-serif font-medium mt-0.5 leading-snug">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-neutral-300 font-light mt-0.5 line-clamp-2">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Caption & Controls (as seen in IMG_6427.jpeg) */}
                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                            {hasCustomPhoto ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Photo originale active</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500">Photographie standard du magazine</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Hidden file input */}
                            <input
                              ref={(el) => {
                                pressFileInputRefs.current[item.id] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePressPhotoUpload(item, e)}
                            />

                            {/* Button matching IMG_6427.jpeg: "Changer photo" or "Mettre IMG_..." */}
                            <button
                              type="button"
                              onClick={() => pressFileInputRefs.current[item.id]?.click()}
                              className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-neutral-100 text-[#1d1d1b] border border-neutral-300 rounded text-xs font-semibold uppercase tracking-wider transition shadow-2xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-neutral-600" />
                              <span>{hasCustomPhoto ? 'Changer photo' : `Mettre ${item.filename}`}</span>
                            </button>

                            {hasCustomPhoto && (
                              <button
                                type="button"
                                onClick={() => handleRemovePressPhoto(item)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 rounded transition cursor-pointer"
                                title="Réinitialiser"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            KRETZ Luxury Real Estate CRM & Database Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-black text-white hover:bg-neutral-800 text-xs font-semibold tracking-wider uppercase transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
