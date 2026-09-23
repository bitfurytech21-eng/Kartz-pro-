import React, { useState, useEffect, useMemo } from 'react';
import { Property, Currency, Language } from './types';
import { TranslationProvider, detectBrowserLanguage, getStoredLanguagePreference } from './i18n';
import rawPropertiesData from './data/properties.json';
import { enrichPropertiesWithOwners } from './data/ownersRegistry';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SelectionSection } from './components/SelectionSection';
import { DreamDestinations } from './components/DreamDestinations';
import { MarketEditorial } from './components/MarketEditorial';
import { FAQSection } from './components/FAQSection';
import { SellEstimateSection } from './components/SellEstimateSection';
import { Footer } from './components/Footer';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { CreateAlertModal } from './components/CreateAlertModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { CalendarDrawer } from './components/CalendarDrawer';
import { AdminPortalModal } from './components/AdminPortalModal';
import { AdminRouteView } from './components/AdminRouteView';
import { CustomerSupportToggle } from './components/CustomerSupportToggle';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { FamilyDirectory } from './components/FamilyDirectory';
import { MarketBarometerSection } from './components/MarketBarometerSection';
import { OffMarketVaultModal } from './components/OffMarketVaultModal';
import { ClientPortalModal } from './components/ClientPortalModal';
import { FinancialSuiteModal } from './components/FinancialSuiteModal';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';
import { PropertyComparisonBar } from './components/PropertyComparisonBar';
import {
  initAuth,
  googleSignIn,
  logout,
  getIdToken,
  isUserAdmin,
  ADMIN_EMAILS,
} from './services/firebaseAuth';
import { testConnection } from './lib/firebase';
import {
  syncUserProfile,
  fetchUserFavorites,
  addFavoriteProperty,
  removeFavoriteProperty,
} from './services/firestoreService';
import { User } from 'firebase/auth';

export default function App() {
  const allProperties = useMemo(() => {
    const qualifiedProperties = (rawPropertiesData as Property[]).filter(
      (p) => (p.price ?? 0) >= 4500000
    );
    return enrichPropertiesWithOwners(qualifiedProperties);
  }, []);

  // Administrator Console state
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash.startsWith('#admin') || hash.startsWith('#/admin');
    }
    return false;
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'inquiries' | 'alerts' | 'clients' | 'owners' | 'family'>('inquiries');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Authentication Modal state (Sign In / Sign Up toggle)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Legal Modal state (Privacy Policy / Terms of Service)
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Google Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPrefillProperty, setCalendarPrefillProperty] = useState<Property | null>(null);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  // VIP & Off-Market Portals state
  const [isOffMarketOpen, setIsOffMarketOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);

  // Saved Properties state with localStorage
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('kretz_saved_properties');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Property Comparison state with localStorage
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('kretz_compared_properties');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Financial Suite (Mortgage, Notary, IFI) modal state
  const [isFinancialSuiteOpen, setIsFinancialSuiteOpen] = useState(false);
  const [financialSuiteProperty, setFinancialSuiteProperty] = useState<Property | null>(null);

  // Currency state
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const stored = localStorage.getItem('kretz_currency');
      return (stored as Currency) || 'EUR';
    } catch {
      return 'EUR';
    }
  });

  // Language state with persistent override and browser language auto-detection
  const [language, setLanguage] = useState<Language>(() => {
    const stored = getStoredLanguagePreference();
    if (stored) return stored;
    return detectBrowserLanguage();
  });

  useEffect(() => {
    // Validate connection to Firestore as mandated by Firebase skill
    testConnection();
  }, []);

  useEffect(() => {
    const unsub = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        const adminCheck = isUserAdmin(user);
        setIsAdmin(adminCheck);
        setIsCalendarConnected(Boolean(token));

        // Sync user profile to Firestore
        try {
          await syncUserProfile(user, { currency, language });
          const firestoreFavorites = await fetchUserFavorites(user.uid);
          if (firestoreFavorites.length > 0) {
            setSavedIds((prev) => Array.from(new Set([...prev, ...firestoreFavorites])));
          }
        } catch (err) {
          console.warn('Firestore user profile/favorites sync notice:', err);
        }

        // Sync user to Cloud SQL database
        try {
          const idToken = await user.getIdToken();
          if (idToken) {
            const res = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                name: user.displayName,
                photoUrl: user.photoURL,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.savedProperties) && data.savedProperties.length > 0) {
                setSavedIds((prev) => Array.from(new Set([...prev, ...data.savedProperties])));
              }
            }
          }
        } catch (err) {
          console.error('Background Cloud SQL user sync failed:', err);
        }
      },
      () => {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsCalendarConnected(false);
      }
    );
    return () => unsub();
  }, [currency, language]);

  const handleOpenAdmin = async (tab: 'inquiries' | 'alerts' | 'clients' | 'owners' | 'family' = 'inquiries') => {
    setAdminInitialTab(tab);
    if (isAdmin) {
      setIsAdminOpen(true);
      return;
    }

    if (!currentUser) {
      try {
        const result = await googleSignIn();
        if (!result) {
          // User cancelled or closed the popup
          return;
        }
        if (result.user) {
          if (isUserAdmin(result.user)) {
            setIsAdminOpen(true);
          } else {
            alert(`Signed in as ${result.user.email}. Note: Administrator console is reserved for authorized managers.`);
          }
        }
      } catch (err: any) {
        if (
          err?.code !== 'auth/cancelled-popup-request' &&
          err?.code !== 'auth/popup-closed-by-user'
        ) {
          console.error('Admin Sign In error:', err);
        }
      }
    } else {
      alert(`Current account (${currentUser.email}) does not have administrator privileges.`);
    }
  };

  const handleSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsAdminOpen(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // Modals & Drawers state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#/annonce/')) {
        const parts = hash.replace('#/annonce/', '').split('/');
        const ref = parts[0];
        if (ref) {
          const found = allProperties.find(
            (p) => p.ref.toLowerCase() === ref.toLowerCase()
          );
          if (found) return found;
        }
      }
    } catch {}
    return null;
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Sync hash routing with selectedProperty
  useEffect(() => {
    if (selectedProperty) {
      const slug = selectedProperty.propertyTypeSlug || 'prestige';
      window.location.hash = `/annonce/${selectedProperty.ref.toLowerCase()}/${slug}`;
    } else {
      if (window.location.hash.startsWith('#/annonce/')) {
        window.location.hash = '';
      }
    }
  }, [selectedProperty]);

  // Listen to browser forward/back button navigation and hidden admin route
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      const lowerHash = rawHash.toLowerCase();

      if (lowerHash.startsWith('#admin') || lowerHash.startsWith('#/admin')) {
        setIsAdminRoute(true);
        if (lowerHash.includes('owner') || lowerHash.includes('propriet')) {
          setAdminInitialTab('owners');
        } else if (lowerHash.includes('alert')) {
          setAdminInitialTab('alerts');
        } else if (lowerHash.includes('client')) {
          setAdminInitialTab('clients');
        } else if (lowerHash.includes('family') || lowerHash.includes('press')) {
          setAdminInitialTab('family');
        } else {
          setAdminInitialTab('inquiries');
        }
        return;
      } else {
        setIsAdminRoute(false);
      }

      if (rawHash.startsWith('#/annonce/')) {
        const parts = rawHash.replace('#/annonce/', '').split('/');
        const ref = parts[0];
        if (ref) {
          const found = allProperties.find(
            (p) => p.ref.toLowerCase() === ref.toLowerCase()
          );
          if (found) setSelectedProperty(found);
        }
      } else if (!rawHash || rawHash === '#' || rawHash === '#/') {
        setSelectedProperty(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Admin Hotkey: Ctrl+Shift+A or Cmd+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.hash = '/admin';
        setIsAdminRoute(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);

    // Check initial hash for hidden admin route
    if (window.location.hash.toLowerCase().startsWith('#admin') || window.location.hash.toLowerCase().startsWith('#/admin')) {
      setIsAdminRoute(true);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [allProperties]);

  useEffect(() => {
    try {
      localStorage.setItem('kretz_saved_properties', JSON.stringify(savedIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('kretz_currency', currency);
    } catch (e) {
      console.error(e);
    }
  }, [currency]);

  const handleToggleSave = async (id: string) => {
    const isCurrentlySaved = savedIds.includes(id);
    setSavedIds((prev) =>
      isCurrentlySaved ? prev.filter((item) => item !== id) : [...prev, id]
    );

    // Sync with Firestore if authenticated
    if (currentUser?.uid) {
      const propObj = allProperties.find((p) => p.id === id);
      const title = propObj?.title || 'Luxury Property';
      if (isCurrentlySaved) {
        removeFavoriteProperty(currentUser.uid, id).catch((err) => {
          console.warn('Firestore remove favorite notice:', err);
        });
      } else {
        addFavoriteProperty(currentUser.uid, id, title).catch((err) => {
          console.warn('Firestore add favorite notice:', err);
        });
      }
    }

    // Sync with Cloud SQL if authenticated
    try {
      const idToken = await getIdToken();
      if (idToken) {
        if (isCurrentlySaved) {
          fetch(`/api/favorites/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${idToken}` },
          }).catch(() => {});
        } else {
          fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ propertyId: id }),
          }).catch(() => {});
        }
      }
    } catch {
      // Non-blocking fallback to local state
    }
  };

  const handleToggleCompare = (property: Property) => {
    setComparedPropertyIds((prev) => {
      const exists = prev.includes(property.id);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== property.id);
      } else {
        if (prev.length >= 4) {
          updated = [...prev.slice(1), property.id];
        } else {
          updated = [...prev, property.id];
        }
      }
      try {
        localStorage.setItem('kretz_compared_properties', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleRemoveComparedProperty = (id: string) => {
    setComparedPropertyIds((prev) => {
      const updated = prev.filter((pId) => pId !== id);
      try {
        localStorage.setItem('kretz_compared_properties', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleClearComparison = () => {
    setComparedPropertyIds([]);
    try {
      localStorage.removeItem('kretz_compared_properties');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFinancialSuite = (property?: Property) => {
    setFinancialSuiteProperty(property || selectedProperty || null);
    setIsFinancialSuiteOpen(true);
  };

  const savedPropertiesList = useMemo(() => {
    return allProperties.filter((p) => savedIds.includes(p.id));
  }, [allProperties, savedIds]);

  const comparedPropertiesList = useMemo(() => {
    return allProperties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [allProperties, comparedPropertyIds]);

  const scrollToSelection = () => {
    const el = document.getElementById('selection-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dedicated Hidden Admin Route
  if (isAdminRoute) {
    return (
      <TranslationProvider language={language} onLanguageChange={setLanguage}>
        <AdminRouteView
          currentUser={currentUser}
          isAdmin={isAdmin}
          properties={allProperties}
          initialTab={adminInitialTab}
          onSelectProperty={(prop) => {
            setSelectedProperty(prop);
            setIsAdminRoute(false);
          }}
          onExitAdmin={() => {
            window.location.hash = '';
            setIsAdminRoute(false);
          }}
        />
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider language={language} onLanguageChange={setLanguage}>
      <div className="min-h-screen bg-white text-[#1d1d1b] flex flex-col selection:bg-[#fae9e5] selection:text-[#1d1d1b]">
        {/* Header */}
        <Header
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          currentLanguage={language}
          onLanguageChange={setLanguage}
          savedCount={savedIds.length}
          onOpenSaved={() => setIsFavoritesOpen(true)}
          onOpenAlert={() => setIsAlertOpen(true)}
          onNavigateToSelection={scrollToSelection}
          comparisonCount={comparedPropertyIds.length}
          onOpenComparison={() => setIsComparisonOpen(true)}
          onOpenFinancialSuite={() => handleOpenFinancialSuite()}
          onOpenCalendar={() => {
            setCalendarPrefillProperty(null);
            setIsCalendarOpen(true);
          }}
          isCalendarConnected={isCalendarConnected}
          isAdmin={isAdmin}
          onOpenOffMarket={() => setIsOffMarketOpen(true)}
          onOpenClientPortal={() => {
            if (currentUser) {
              setIsClientPortalOpen(true);
            } else {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
            }
          }}
          userEmail={currentUser?.email}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Hero Section */}
          <Hero onExploreClick={scrollToSelection} />

          {/* Selection Section: List / Map, Filters, Property Grid, Pagination */}
          <SelectionSection
            allProperties={allProperties}
            currency={currency}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectProperty={setSelectedProperty}
            onOpenAlert={() => setIsAlertOpen(true)}
            comparedIds={comparedPropertyIds}
            onToggleCompare={handleToggleCompare}
          />

          {/* Dream Destinations Carousel */}
          <DreamDestinations />

          {/* Market Intelligence & Editorial Section */}
          <MarketEditorial />

          {/* Prestige Market Barometer & Indices (Feature 4) */}
          <MarketBarometerSection />

          {/* Kretz Family Directory & Private Client Office (Feature 4) */}
          <FamilyDirectory />

          {/* FAQ Accordion Section */}
          <FAQSection />

          {/* Sell / Valuation Estimate Section */}
          <SellEstimateSection />
        </main>

        {/* Footer */}
        <Footer
          onOpenLegal={(type) => setLegalModalType(type)}
        />

        {/* Property Detail Modal */}
        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            currency={currency}
            isSaved={savedIds.includes(selectedProperty.id)}
            onToggleSave={handleToggleSave}
            onClose={() => setSelectedProperty(null)}
            onSelectProperty={setSelectedProperty}
            allProperties={allProperties}
            currentLanguage={language}
            isCompared={comparedPropertyIds.includes(selectedProperty.id)}
            onToggleCompare={handleToggleCompare}
            onOpenFinancialSuite={handleOpenFinancialSuite}
            onOpenOwnersManager={() => {
              window.location.hash = '/admin/owners';
              setIsAdminRoute(true);
            }}
            onOpenCalendarWithProperty={(property) => {
              setCalendarPrefillProperty(property);
              setIsCalendarOpen(true);
            }}
          />
        )}

        {/* Create Alert Modal */}
        {isAlertOpen && (
          <CreateAlertModal
            isOpen={isAlertOpen}
            onClose={() => setIsAlertOpen(false)}
          />
        )}

        {/* Saved Properties Drawer */}
        {isFavoritesOpen && (
          <FavoritesDrawer
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            savedProperties={savedPropertiesList}
            onRemove={handleToggleSave}
            onSelectProperty={setSelectedProperty}
            currency={currency}
          />
        )}

        {/* Google Calendar Viewing Schedule Drawer */}
        <CalendarDrawer
          isOpen={isCalendarOpen}
          onClose={() => {
            setIsCalendarOpen(false);
            setCalendarPrefillProperty(null);
          }}
          prefillProperty={calendarPrefillProperty}
        />

        {/* Administrator Portal Modal */}
        {isAdminOpen && (
          <AdminPortalModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            adminEmail={currentUser?.email || 'info@kretz.site'}
            properties={allProperties}
            initialTab={adminInitialTab}
            onSelectProperty={(prop) => {
              setSelectedProperty(prop);
              setIsAdminOpen(false);
            }}
          />
        )}

        {/* Floating Customer Support & Concierge Toggle (Hidden when viewing specific property to avoid overlapping floating buttons) */}
        {!selectedProperty && (
          <CustomerSupportToggle
            userEmail={currentUser?.email}
            onOpenCalendar={() => {
              setCalendarPrefillProperty(null);
              setIsCalendarOpen(true);
            }}
          />
        )}

        {/* Off-Market Confidential Inventory Vault (Feature 2) */}
        <OffMarketVaultModal
          isOpen={isOffMarketOpen}
          onClose={() => setIsOffMarketOpen(false)}
          currency={currency}
          onSelectPropertyRef={(ref) => {
            const found = allProperties.find(
              (p) => p.ref.toLowerCase() === ref.toLowerCase()
            );
            if (found) {
              setSelectedProperty(found);
              setIsOffMarketOpen(false);
            }
          }}
        />

        {/* Private Client Portal / Inquiry Dashboard (Feature 2) */}
        <ClientPortalModal
          isOpen={isClientPortalOpen}
          onClose={() => setIsClientPortalOpen(false)}
          currentUser={currentUser}
          savedProperties={savedPropertiesList}
          onRemoveFavorite={handleToggleSave}
          onOpenProperty={(property) => {
            setSelectedProperty(property);
            setIsClientPortalOpen(false);
          }}
          onOpenCalendar={(prop) => {
            setCalendarPrefillProperty(prop || null);
            setIsCalendarOpen(true);
            setIsClientPortalOpen(false);
          }}
          onOpenAlertModal={() => {
            setIsAlertOpen(true);
            setIsClientPortalOpen(false);
          }}
          onSignOut={handleSignOut}
          currency={currency}
        />

        {/* Private Client Auth Modal (Sign In / Sign Up toggle) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onOpenLegal={(type) => setLegalModalType(type)}
        />

        {/* Legal Modal (Privacy Policy & Terms of Service for Google Verification) */}
        {legalModalType && (
          <LegalModal
            isOpen={Boolean(legalModalType)}
            onClose={() => setLegalModalType(null)}
            type={legalModalType}
          />
        )}

        {/* Floating Dock for Property Comparison */}
        <PropertyComparisonBar
          comparedProperties={comparedPropertiesList}
          onOpenComparison={() => setIsComparisonOpen(true)}
          onRemoveProperty={handleRemoveComparedProperty}
          onClearAll={handleClearComparison}
          currency={currency}
        />

        {/* Side-by-Side Property Comparison Matrix Modal */}
        <PropertyComparisonModal
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          properties={comparedPropertiesList}
          onRemoveProperty={handleRemoveComparedProperty}
          onClearAll={handleClearComparison}
          onSelectProperty={(property) => {
            setSelectedProperty(property);
            setIsComparisonOpen(false);
          }}
          onOpenCalendar={(property) => {
            setCalendarPrefillProperty(property);
            setIsCalendarOpen(true);
            setIsComparisonOpen(false);
          }}
          currency={currency}
          allProperties={allProperties}
          onAddProperty={handleToggleCompare}
        />

        {/* Comprehensive French Financial & Notary / Wealth Tax Suite Modal */}
        <FinancialSuiteModal
          isOpen={isFinancialSuiteOpen}
          onClose={() => {
            setIsFinancialSuiteOpen(false);
            setFinancialSuiteProperty(null);
          }}
          currency={currency}
          initialProperty={financialSuiteProperty}
          onSelectProperty={(property) => {
            setSelectedProperty(property);
            setIsFinancialSuiteOpen(false);
          }}
        />
      </div>
    </TranslationProvider>
  );
}
