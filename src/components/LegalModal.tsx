import React, { useState } from 'react';
import { X, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      id="legal-modal-overlay"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl border border-neutral-200 max-h-[85vh] flex flex-col overflow-hidden"
        id="legal-modal-container"
      >
        <div className="h-1 bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900" />

        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CompanyLogo variant="compact" theme="light" />
            <div className="border-l border-neutral-200 pl-3">
              <h2 className="text-base font-serif-luxury text-[#1d1d1b]">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                kretz.site • Kretz Real Estate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto text-xs text-neutral-600 leading-relaxed space-y-4">
          {type === 'privacy' ? (
            <>
              <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-100 text-[11px] text-neutral-700">
                <strong>Effective Date:</strong> January 1, 2025 • <strong>Last Updated:</strong> September 2026<br />
                <strong>Domain:</strong> https://kretz.site<br />
                <strong>Support Contact:</strong> info@kretz.site
              </div>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">1. Information We Collect</h3>
              <p>
                Kretz Real Estate ("we", "our", or "the Agency") respects your privacy. When you interact with our web platform or authenticate via Google Sign-In, we only collect minimal essential information: your name, email address, and profile photo provided by Google Identity Services to personalize your experience.
              </p>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">2. Use of Google User Data</h3>
              <p>
                Our application accesses Google User Data solely for authentication purposes (`email`, `profile`, `openid`). We strictly adhere to the Google API Services User Data Policy, including Limited Use requirements:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We do NOT sell, transfer, or lease user data to third parties.</li>
                <li>We do NOT use Google user data for advertising or marketing surveillance.</li>
                <li>We do NOT read or store your personal Gmail inboxes.</li>
                <li>Your tokens and authentication state remain in-memory and are never exposed publicly.</li>
              </ul>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">3. Data Storage & Security</h3>
              <p>
                User profile records, saved properties, and consultation requests are stored securely using Google Cloud infrastructure with TLS 1.3 encryption in transit and AES-256 encryption at rest.
              </p>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">4. Data Deletion & Rights</h3>
              <p>
                You may request immediate deletion of your account and associated saved properties at any time by contacting our Privacy Representative at <span className="font-mono text-neutral-800">info@kretz.site</span>.
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-100 text-[11px] text-neutral-700">
                <strong>Effective Date:</strong> January 1, 2025<br />
                <strong>Domain:</strong> https://kretz.site<br />
                <strong>Operator:</strong> Kretz Real Estate & Private Client Services
              </div>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">1. Acceptance of Terms</h3>
              <p>
                By accessing this application at <span className="font-mono text-neutral-800">https://kretz.site</span>, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">2. Real Estate Consultation & Mandates</h3>
              <p>
                All property listings, square footage, valuations, and architectural details presented on this platform are for informational purposes. Final acquisition terms, notarized deeds, and exclusivity agreements are finalized directly with licensed Kretz luxury advisors.
              </p>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">3. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your authenticated account.
              </p>

              <h3 className="text-sm font-semibold text-[#1d1d1b]">4. Contact & Inquiries</h3>
              <p>
                For questions regarding terms or official representation, reach our legal desk at <span className="font-mono text-neutral-800">info@kretz.site</span>.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-mono">
            GDPR & Google OAuth 2.0 Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1d1d1b] text-white rounded-sm text-xs font-semibold hover:bg-black transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
