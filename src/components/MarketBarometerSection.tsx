import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  FileText,
  BarChart3,
  Globe,
  Sparkles,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

export const MarketBarometerSection: React.FC = () => {
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [downloadedReport, setDownloadedReport] = useState<string | null>(null);

  const marketIndices = [
    {
      region: 'Paris Prime & Golden Triangle',
      avgPricePerM2: '€19,450 / m²',
      annualGrowth: '+3.8%',
      trendPositive: true,
      keyDriver: 'High international demand for turnkey Haussmannian apartments with private balconies.',
      topDepartment: 'Paris 7e, 8e & 16e',
    },
    {
      region: 'French Riviera Waterfront',
      avgPricePerM2: '€32,800 / m²',
      annualGrowth: '+6.2%',
      trendPositive: true,
      keyDriver: 'Unprecedented scarcity for "pieds-dans-l’eau" sanctuaries in Cannes and Cap d’Antibes.',
      topDepartment: 'Alpes-Maritimes & Var',
    },
    {
      region: 'Alpine High-Altitude Chalets',
      avgPricePerM2: '€26,100 / m²',
      annualGrowth: '+4.5%',
      trendPositive: true,
      keyDriver: 'Ski-in / ski-out chalets in Courchevel 1850 commanding premier valuations.',
      topDepartment: 'Savoie (73) & Haute-Savoie',
    },
    {
      region: 'Historic Châteaux & Wine Bastides',
      avgPricePerM2: '€5,200,000 avg estate',
      annualGrowth: '+2.4%',
      trendPositive: true,
      keyDriver: 'Strong appeal for family estates with Grand Cru AOC vineyards and private hunting parks.',
      topDepartment: 'Loire Valley, Provence & Bordeaux',
    },
  ];

  const macroStats = [
    { label: 'Average Days on Market', value: '48 Days', desc: 'Prestige estates (<€15M)' },
    { label: 'International HNWI Buyers', value: '68%', desc: 'US, UK, Switzerland, Middle East' },
    { label: 'Off-Market Transactions', value: '42%', desc: 'Traded in strict confidentiality' },
    { label: 'Cash / Private Equity Funding', value: '81%', desc: 'Direct non-contingent capital' },
  ];

  const reports = [
    {
      id: 'paris-q3',
      title: 'Q3 2026 Paris Prime Luxury Index',
      subtitle: 'Complete analysis of 7e, 8e, 16e micro-markets, m² valuation benchmarks & foreign capital flows.',
      pages: '28 Pages · Comprehensive Dossier',
      badge: 'Published September 2026',
    },
    {
      id: 'riviera-q3',
      title: 'French Riviera Ultra-Prime Waterfront Barometer',
      subtitle: 'Cap d’Antibes, Saint-Tropez, and Saint-Jean-Cap-Ferrat shoreline transactions and inventory depth.',
      pages: '34 Pages · Architectural Study',
      badge: 'Exclusive Kretz Analysis',
    },
    {
      id: 'alpine-q3',
      title: 'Alpine Trophy Chalet Investment & Yield Report',
      subtitle: 'Courchevel 1850 & Megève seasonal rental performance, ski-in/ski-out premiums, and capital appreciation.',
      pages: '22 Pages · Financial Guide',
      badge: 'Winter 2026 Forecast',
    },
  ];

  const handleDownload = (reportId: string, title: string) => {
    setDownloadingReport(reportId);
    setTimeout(() => {
      setDownloadingReport(null);
      setDownloadedReport(title);
      setTimeout(() => setDownloadedReport(null), 4000);
    }, 1200);
  };

  return (
    <section id="market-barometer" className="py-24 bg-[#fae9e5]/30 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.3em] font-semibold text-neutral-600">
            <BarChart3 className="w-3.5 h-3.5 text-neutral-800" />
            <span>Market Intelligence & Editorial</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light font-serif-luxury tracking-wide text-[#1d1d1b]">
            The Kretz Prestige Market Barometer
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            Quarterly analytical insights into France’s premier real estate micro-markets, curated by our research advisory desk.
          </p>
        </div>

        {/* Macro Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {macroStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-sm border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                {stat.label}
              </span>
              <span className="text-2xl sm:text-3xl font-serif-luxury font-light text-[#1d1d1b] my-1 block">
                {stat.value}
              </span>
              <span className="text-[11px] text-neutral-500 font-light block">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Micro-Market Benchmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {marketIndices.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-sm border border-neutral-200 shadow-xs hover:border-neutral-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium block">
                      {item.topDepartment}
                    </span>
                    <h3 className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                      {item.region}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {item.annualGrowth} YoY
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-500">Benchmark Index:</span>
                  <span className="text-xl font-serif-luxury font-light text-[#1d1d1b]">
                    {item.avgPricePerM2}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  {item.keyDriver}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Downloadable Research Reports */}
        <div className="bg-white rounded-sm border border-neutral-200 p-8 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4 mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold block">
                Executive Dossiers
              </span>
              <h3 className="text-2xl font-light font-serif-luxury text-[#1d1d1b]">
                Download Quarterly Research Reports
              </h3>
            </div>
            <p className="text-xs text-neutral-500 font-light max-w-sm sm:text-right">
              Privately circulated to institutional partners and certified family offices.
            </p>
          </div>

          {downloadedReport && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-3 text-emerald-800 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{downloadedReport}</strong> generated and dispatched. Check your downloads dossier.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const isCurrent = downloadingReport === report.id;
              return (
                <div
                  key={report.id}
                  className="bg-neutral-50/50 p-6 rounded-sm border border-neutral-200 flex flex-col justify-between hover:border-neutral-400 transition-colors"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-neutral-200/80 text-neutral-700">
                      {report.badge}
                    </span>
                    <h4 className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                      {report.title}
                    </h4>
                    <p className="text-xs text-neutral-600 font-light leading-relaxed">
                      {report.subtitle}
                    </p>
                    <span className="text-[11px] text-neutral-500 font-mono block">
                      {report.pages}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(report.id, report.title)}
                    disabled={isCurrent}
                    className="mt-6 w-full py-2.5 bg-[#1d1d1b] text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isCurrent ? 'Compiling Dossier...' : 'Download Whitepaper'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
