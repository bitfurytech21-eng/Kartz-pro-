import React, { useState, useMemo } from 'react';
import {
  Property,
  Currency,
  ViewMode,
  SortOption,
  FilterState,
} from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertyMap } from './PropertyMap';
import { useTranslation } from '../i18n';
import {
  SlidersHorizontal,
  Bell,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Grid,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';

interface SelectionSectionProps {
  allProperties: Property[];
  currency: Currency;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onOpenAlert: () => void;
  comparedIds?: string[];
  onToggleCompare?: (property: Property) => void;
}

export const SelectionSection: React.FC<SelectionSectionProps> = ({
  allProperties,
  currency,
  savedIds,
  onToggleSave,
  onSelectProperty,
  onOpenAlert,
  comparedIds = [],
  onToggleCompare,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('descPrice');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const initialFilters: FilterState = {
    search: '',
    propertyType: 'All',
    region: 'All',
    minPrice: null,
    maxPrice: null,
    minRooms: null,
    minBedrooms: null,
    minSurface: null,
    isOffMarketOnly: false,
    isExclusiveOnly: false,
    mandateType: 'all',
    transactionType: 'all',
    poolOnly: false,
    acOnly: false,
    elevatorOnly: false,
    terraceOnly: false,
    balconyOnly: false,
    gardenOnly: false,
    chimneyOnly: false,
    tennisOnly: false,
    jacuzziOnly: false,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Extract unique regions & property types
  const propertyTypes = [
    'All',
    'Apartment',
    'House',
    'Villa',
    'Château',
    'Private Mansion',
    'Chalet',
    'Architect House',
    'Estate / Property',
    'Provençal Mas',
    'Contemporary House',
    'Duplex / Penthouse',
    'Manor',
    'Equestrian Estate',
    'Vineyard Estate',
  ];

  const regions = [
    'All',
    'Île-de-France',
    'Provence-Alpes-Côte-d\'Azur',
    'Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Bretagne',
    'Normandie',
    'Hauts-de-France',
    'Pays-de-la-Loire',
    'Grand Est',
    'Bourgogne-Franche-Comté',
    'Centre-Val de Loire',
    'Corse',
  ];

  // Filter properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      // Search text in location, city, department, ref, title
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesQuery =
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.ref.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Property type
      if (filters.propertyType !== 'All') {
        const typeMatch =
          p.typeDisplay.toLowerCase() === filters.propertyType.toLowerCase() ||
          p.propertyType.toLowerCase() === filters.propertyType.toLowerCase();
        if (!typeMatch) return false;
      }

      // Region
      if (filters.region !== 'All') {
        if (!p.region.includes(filters.region)) return false;
      }

      // Price
      if (filters.minPrice !== null && p.price !== null && p.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && p.price !== null && p.price > filters.maxPrice) {
        return false;
      }

      // Minimum Rooms
      if (filters.minRooms !== null && p.rooms < filters.minRooms) {
        return false;
      }

      // Minimum Bedrooms
      if (filters.minBedrooms !== null && p.bedrooms < filters.minBedrooms) {
        return false;
      }

      // Minimum Surface
      if (filters.minSurface !== null && p.surface < filters.minSurface) {
        return false;
      }

      // Mandate & Status
      if (filters.mandateType === 'exclusive' && !p.isExclusive) return false;
      if (filters.mandateType === 'co-exclusive' && !p.isCoExclusive) return false;
      if (filters.mandateType === 'off-market' && !p.isOffMarket) return false;

      // Legacy checkbox compatibility
      if (filters.isOffMarketOnly && !p.isOffMarket) return false;
      if (filters.isExclusiveOnly && !p.isExclusive) return false;

      // Transaction type
      if (filters.transactionType === 'sale' && p.statutVente !== 'Vente') return false;
      if (filters.transactionType === 'rental' && p.statutVente !== 'Location') return false;
      if (filters.transactionType === 'seasonal' && p.statutVente !== 'LocSaison') return false;

      // Amenities
      if (filters.poolOnly && !p.amenities.pool) return false;
      if (filters.acOnly && !p.amenities.ac) return false;
      if (filters.elevatorOnly && !p.amenities.elevator) return false;
      if (filters.terraceOnly && !p.amenities.terrace) return false;
      if (filters.balconyOnly && !p.amenities.balcony) return false;
      if (filters.gardenOnly && !p.amenities.garden) return false;
      if (filters.chimneyOnly && !p.amenities.chimney) return false;
      if (filters.tennisOnly && !p.amenities.tennis) return false;
      if (filters.jacuzziOnly && !p.amenities.jacuzzi) return false;

      return true;
    });
  }, [allProperties, filters]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortOption === 'descPrice') {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortOption === 'ascPrice') {
      list.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    } else if (sortOption === 'surfaceDesc') {
      list.sort((a, b) => b.surface - a.surface);
    } else if (sortOption === 'roomsDesc') {
      list.sort((a, b) => b.rooms - a.rooms);
    } else if (sortOption === 'newest') {
      // maintain initial curated order
      return list;
    }
    return list;
  }, [filteredProperties, sortOption]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedProperties.length / itemsPerPage));
  const displayedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProperties.slice(start, start + itemsPerPage);
  }, [sortedProperties, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('selection-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.propertyType !== 'All' ||
    filters.region !== 'All' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minRooms !== null ||
    filters.minBedrooms !== null ||
    filters.minSurface !== null ||
    filters.mandateType !== 'all' ||
    filters.transactionType !== 'all' ||
    filters.isOffMarketOnly ||
    filters.isExclusiveOnly ||
    filters.poolOnly ||
    filters.acOnly ||
    filters.elevatorOnly ||
    filters.terraceOnly ||
    filters.balconyOnly ||
    filters.gardenOnly ||
    filters.chimneyOnly ||
    filters.tennisOnly ||
    filters.jacuzziOnly;

  return (
    <section className="relative w-full py-10 bg-white">
      {/* Anchor matching original kretz url /en/france/#selection-section */}
      <div id="selection-section" className="relative -top-24"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar: List/Map Switch, Create Alert, Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200 gap-4">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center space-x-3">
            <div className="map-list-toggle" role="group" aria-label="View toggle">
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1.5 ${viewMode === 'map' ? 'active' : ''}`}
              >
                <MapIcon className="w-3 h-3" />
                <span>{t.filters.map}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 ${viewMode === 'list' ? 'active' : ''}`}
              >
                <Grid className="w-3 h-3" />
                <span>{t.filters.list}</span>
              </button>
            </div>

            <span className="text-xs text-neutral-500 font-light hidden md:inline">
              {t.filters.showingProperties.replace('{count}', sortedProperties.length.toString())}
            </span>
          </div>

          {/* Right: Alert Button & Sort Select */}
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <button
              id="selection-create-alert-btn"
              type="button"
              onClick={onOpenAlert}
              className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-sm border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all text-[#1d1d1b]"
            >
              <span>{t.filters.createAlert}</span>
              <Bell className="w-3.5 h-3.5 text-neutral-600" />
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="sort-select"
                className="text-xs text-neutral-500 uppercase tracking-wider font-medium hidden lg:inline"
              >
                {t.filters.sort}
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="appearance-none bg-transparent border-b border-neutral-300 text-xs text-[#1d1d1b] font-medium py-1.5 pl-2 pr-7 focus:outline-none focus:border-black cursor-pointer uppercase tracking-wider"
                >
                  <option value="descPrice">{t.filters.descendingPrice}</option>
                  <option value="ascPrice">{t.filters.ascendingPrice}</option>
                  <option value="newest">{t.filters.curatedSelection}</option>
                  <option value="surfaceDesc">{t.filters.largestSurface}</option>
                  <option value="roomsDesc">{t.filters.mostRooms}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#fcfbf9] border border-neutral-200/80 p-4 sm:p-5 rounded-sm mb-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder={t.filters.searchPlaceholder}
                className="w-full bg-white border border-neutral-200 text-xs py-2.5 pl-9 pr-3 rounded-sm focus:outline-none focus:border-black font-light text-[#1d1d1b] placeholder:text-neutral-400"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <select
                value={filters.propertyType}
                onChange={(e) => {
                  setFilters({ ...filters, propertyType: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-neutral-200 text-xs py-2.5 px-3 rounded-sm focus:outline-none focus:border-black font-medium text-[#1d1d1b] cursor-pointer"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Property Types' : type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>

            {/* Region Dropdown */}
            <div className="relative">
              <select
                value={filters.region}
                onChange={(e) => {
                  setFilters({ ...filters, region: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-neutral-200 text-xs py-2.5 px-3 rounded-sm focus:outline-none focus:border-black font-medium text-[#1d1d1b] cursor-pointer"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'All' ? 'All Regions in France' : region}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>

            {/* More Filters Toggle & Clear Button */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex-1 flex items-center justify-center space-x-1.5 text-xs py-2.5 px-3 rounded-sm border font-medium transition-colors ${
                  showAdvancedFilters
                    ? 'bg-[#1d1d1b] text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.filters.filters}</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1"></span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 bg-white border border-neutral-200 hover:border-black text-neutral-600 hover:text-black rounded-sm text-xs font-medium flex items-center space-x-1"
                  title={t.filters.reset}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.filters.reset}</span>
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Expandable Drawer */}
          {showAdvancedFilters && (
            <div className="pt-4 mt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn text-xs">
              {/* Transaction Type */}
              <div>
                <label className="block text-neutral-500 font-medium uppercase tracking-wider mb-1 text-[11px]">
                  Transaction
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => {
                    setFilters({ ...filters, transactionType: e.target.value as any });
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-neutral-200 py-2 px-3 rounded-sm text-xs"
                >
                  <option value="all">All (Sale & Rentals)</option>
                  <option value="sale">For Sale (Vente)</option>
                  <option value="rental">Long-Term Rental (Location)</option>
                  <option value="seasonal">Seasonal Rental (LocSaison)</option>
                </select>
              </div>

              {/* Price Min / Max */}
              <div>
                <label className="block text-neutral-500 font-medium uppercase tracking-wider mb-1 text-[11px]">
                  Max Budget
                </label>
                <select
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFilters({ ...filters, maxPrice: val });
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-neutral-200 py-2 px-3 rounded-sm text-xs"
                >
                  <option value="">Any Budget</option>
                  <option value="6000000">Up to 6 000 000 €</option>
                  <option value="10000000">Up to 10 000 000 €</option>
                  <option value="20000000">Up to 20 000 000 €</option>
                  <option value="40000000">Up to 40 000 000 €</option>
                  <option value="60000000">Up to 60 000 000 €</option>
                  <option value="100000000">Up to 100 000 000 €</option>
                </select>
              </div>

              {/* Min Bedrooms */}
              <div>
                <label className="block text-neutral-500 font-medium uppercase tracking-wider mb-1 text-[11px]">
                  Bedrooms
                </label>
                <select
                  value={filters.minBedrooms ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFilters({ ...filters, minBedrooms: val });
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-neutral-200 py-2 px-3 rounded-sm text-xs"
                >
                  <option value="">Any Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="6">6+ Bedrooms</option>
                  <option value="8">8+ Bedrooms</option>
                </select>
              </div>

              {/* Min Surface */}
              <div>
                <label className="block text-neutral-500 font-medium uppercase tracking-wider mb-1 text-[11px]">
                  Min Surface
                </label>
                <select
                  value={filters.minSurface ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFilters({ ...filters, minSurface: val });
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-neutral-200 py-2 px-3 rounded-sm text-xs"
                >
                  <option value="">Any surface</option>
                  <option value="150">150+ sqm</option>
                  <option value="300">300+ sqm</option>
                  <option value="500">500+ sqm</option>
                  <option value="800">800+ sqm</option>
                  <option value="1200">1 200+ sqm</option>
                </select>
              </div>

              {/* Mandate & Special Status Selection */}
              <div className="sm:col-span-2 md:col-span-4 pt-2 border-t border-neutral-200 flex flex-wrap items-center gap-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Mandate Status:
                </span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mandateType"
                    checked={filters.mandateType === 'all'}
                    onChange={() => {
                      setFilters({ ...filters, mandateType: 'all', isOffMarketOnly: false, isExclusiveOnly: false });
                      setCurrentPage(1);
                    }}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-700">All Mandates</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mandateType"
                    checked={filters.mandateType === 'exclusive'}
                    onChange={() => {
                      setFilters({ ...filters, mandateType: 'exclusive', isOffMarketOnly: false, isExclusiveOnly: true });
                      setCurrentPage(1);
                    }}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-700 font-medium">Exclusives Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mandateType"
                    checked={filters.mandateType === 'co-exclusive'}
                    onChange={() => {
                      setFilters({ ...filters, mandateType: 'co-exclusive', isOffMarketOnly: false, isExclusiveOnly: false });
                      setCurrentPage(1);
                    }}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-700">Co-Exclusives</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mandateType"
                    checked={filters.mandateType === 'off-market'}
                    onChange={() => {
                      setFilters({ ...filters, mandateType: 'off-market', isOffMarketOnly: true, isExclusiveOnly: false });
                      setCurrentPage(1);
                    }}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-700 font-medium">Off-Market Only</span>
                </label>
              </div>

              {/* Amenities checkboxes */}
              <div className="sm:col-span-2 md:col-span-4 pt-3 border-t border-neutral-200 flex flex-wrap gap-x-5 gap-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.poolOnly}
                    onChange={(e) => setFilters({ ...filters, poolOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Swimming Pool</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.acOnly}
                    onChange={(e) => setFilters({ ...filters, acOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Air Conditioning</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.elevatorOnly}
                    onChange={(e) => setFilters({ ...filters, elevatorOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Elevator</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.terraceOnly}
                    onChange={(e) => setFilters({ ...filters, terraceOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Terrace</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.balconyOnly}
                    onChange={(e) => setFilters({ ...filters, balconyOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Balcony</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.gardenOnly}
                    onChange={(e) => setFilters({ ...filters, gardenOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Garden / Park</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.chimneyOnly}
                    onChange={(e) => setFilters({ ...filters, chimneyOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Fireplace</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.tennisOnly}
                    onChange={(e) => setFilters({ ...filters, tennisOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Tennis Court</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.jacuzziOnly}
                    onChange={(e) => setFilters({ ...filters, jacuzziOnly: e.target.checked })}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Jacuzzi / Spa</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Content View: List or Map */}
        {viewMode === 'map' ? (
          <div className="mb-12 h-[680px] w-full rounded-sm overflow-hidden border border-neutral-200 shadow-md">
            <PropertyMap
              properties={sortedProperties}
              currency={currency}
              onSelectProperty={onSelectProperty}
            />
          </div>
        ) : (
          <div>
            {/* Grid of Property Cards */}
            {displayedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 mb-12">
                {displayedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    currency={currency}
                    isSaved={savedIds.includes(prop.id)}
                    onToggleSave={onToggleSave}
                    onSelect={onSelectProperty}
                    isCompared={comparedIds.includes(prop.id)}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-neutral-300 rounded-sm mb-12">
                <p className="text-lg font-light text-neutral-600 mb-2">
                  No properties matched your current criteria.
                </p>
                <p className="text-xs text-neutral-400 mb-6">
                  Try adjusting or resetting your search filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#1d1d1b] text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Authentic Kretz Pagination (1, 2, ..., 76) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 py-8 border-t border-neutral-100">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-neutral-200 rounded-sm hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                </button>

                {/* Page 1 */}
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  className={`w-9 h-9 text-xs font-medium rounded-sm border transition-colors ${
                    currentPage === 1
                      ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                      : 'border-neutral-200 text-neutral-700 hover:border-black'
                  }`}
                >
                  1
                </button>

                {/* Page 2 if exists */}
                {totalPages >= 2 && (
                  <button
                    type="button"
                    onClick={() => handlePageChange(2)}
                    className={`w-9 h-9 text-xs font-medium rounded-sm border transition-colors ${
                      currentPage === 2
                        ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    2
                  </button>
                )}

                {/* Page 3 if current is 3 or near */}
                {currentPage > 2 && currentPage < 76 && (
                  <button
                    type="button"
                    className="w-9 h-9 text-xs font-medium rounded-sm border bg-[#1d1d1b] text-white border-[#1d1d1b]"
                  >
                    {currentPage}
                  </button>
                )}

                {/* Ellipsis matching original site */}
                <span className="px-1 text-neutral-400 text-xs">...</span>

                {/* Last Page (e.g. 76 or actual total) */}
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(76, totalPages))}
                  className={`w-9 h-9 text-xs font-medium rounded-sm border transition-colors ${
                    currentPage === Math.min(76, totalPages)
                      ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                      : 'border-neutral-200 text-neutral-700 hover:border-black'
                  }`}
                >
                  76
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 border border-neutral-200 rounded-sm hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-700" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
