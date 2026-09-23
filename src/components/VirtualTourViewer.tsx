import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  Compass,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Video,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { Property } from '../types';

interface VirtualTourViewerProps {
  property: Property;
  onClose?: () => void;
}

type TourMode = 'interactive' | 'official-proxy' | 'cinematic';

interface TourRoom {
  id: number;
  name: string;
  image: string;
  description: string;
  hotspots: {
    targetRoomId: number;
    title: string;
    yaw: number; // angle in degrees -180 to 180
    pitch: number; // vertical angle -30 to 30
  }[];
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  property,
}) => {
  const [mode, setMode] = useState<TourMode>('interactive');
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Rotation angles for 360 viewer
  const [yaw, setYaw] = useState(0); // -180 to 180
  const [pitch, setPitch] = useState(0); // -40 to 40
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ oscillator?: OscillatorNode; gain?: GainNode; noiseGain?: GainNode } | null>(null);

  // Derive rooms dynamically from the authentic property images
  const rooms: TourRoom[] = useMemo(() => {
    const rawImages = property.images && property.images.length > 0
      ? property.images
      : ['https://files.kretzrealestate.com/67ec4082a8f72d825044d16021ae9bdf.jpg'];

    const roomNames = [
      'Grand Reception & Salon',
      'Primary Master Suite',
      'Panoramic Terrace & Views',
      'Private Grounds & Swimming Pool',
      'Formal Dining & Gallery',
      "Chef's Kitchen & Breakfast Bar",
      'Guest Pavilion & Suite',
      'Wellness Spa & Lounge',
      'Wine Cellar & Library',
      'Rooftop Solarium',
    ];

    return rawImages.slice(0, 8).map((img, idx) => {
      const nextIdx = (idx + 1) % Math.min(rawImages.length, 8);
      const prevIdx = (idx - 1 + Math.min(rawImages.length, 8)) % Math.min(rawImages.length, 8);
      
      const hotspots = [];
      if (rawImages.length > 1) {
        hotspots.push({
          targetRoomId: nextIdx,
          title: roomNames[nextIdx] || `Room ${nextIdx + 1}`,
          yaw: 45,
          pitch: 0,
        });
        if (rawImages.length > 2) {
          hotspots.push({
            targetRoomId: prevIdx,
            title: roomNames[prevIdx] || `Room ${prevIdx + 1}`,
            yaw: -60,
            pitch: 5,
          });
        }
      }

      return {
        id: idx,
        name: roomNames[idx] || `Gallery Space ${idx + 1}`,
        image: img,
        description: `${property.typeDisplay} · ${property.location}`,
        hotspots,
      };
    });
  }, [property]);

  const currentRoom = rooms[currentRoomIndex] || rooms[0];

  // Auto-rotation animation loop
  useEffect(() => {
    if (!isAutoRotating || mode !== 'interactive') return;

    const interval = setInterval(() => {
      if (!isDraggingRef.current) {
        setYaw((prev) => (prev + 0.15) % 360);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isAutoRotating, mode]);

  // Ambient audio synthesizer (peaceful luxury estate soundscape)
  const toggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Soft ambient pink noise filter (mimics gentle breeze / fountain)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(0);

      // Warm harmonic tone (luxury atmosphere)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(174, ctx.currentTime); // Solfeggio soothing frequency
      oscGain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(0);

      audioNodesRef.current = { oscillator: osc, gain: oscGain, noiseGain: gain };
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Mouse / Touch handlers for 360 interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'interactive') return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || mode !== 'interactive') return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.35 / zoom;
    setYaw((prev) => (prev - deltaX * sensitivity + 360) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * sensitivity)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const officialTourUrl = property.tourUrl || `/kretz-tour/en/annonce/${property.ref.toLowerCase()}/${property.propertyTypeSlug || 'property'}/`;
  const directKretzUrl = property.externalTourUrl || `https://kretzrealestate.com/en/annonce/${property.ref.toLowerCase()}/${property.propertyTypeSlug || 'property'}/`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#141414] text-white rounded-lg overflow-hidden flex flex-col select-none transition-all duration-300 ${
        isFullscreen ? 'h-screen' : 'h-[580px] sm:h-[640px]'
      }`}
    >
      {/* Top Navigation & Status Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto backdrop-blur-[2px]">
        {/* Left: Property Info & Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setMode('interactive')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'interactive'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>360° Walkthrough</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('official-proxy');
                setIframeLoaded(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'official-proxy'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Official Kretz Tour</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('cinematic')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'cinematic'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>HD Video</span>
            </button>
          </div>

          <div className="hidden md:flex items-center text-xs text-neutral-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <MapPin className="w-3 h-3 text-neutral-400 mr-1.5" />
            <span className="font-medium text-white mr-2">{property.ref}</span>
            <span className="text-neutral-400 truncate max-w-[200px]">{property.location}</span>
          </div>
        </div>

        {/* Right: Interactive Controls */}
        <div className="flex items-center space-x-2">
          {mode === 'interactive' && (
            <>
              {/* Compass Heading */}
              <div
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs text-neutral-300"
                title="Current Camera Heading"
              >
                <Compass
                  className="w-3.5 h-3.5 text-neutral-400 transition-transform duration-100"
                  style={{ transform: `rotate(${yaw}deg)` }}
                />
                <span className="font-mono text-[11px]">{Math.round(yaw)}°</span>
              </div>

              {/* Auto-rotation toggle */}
              <button
                type="button"
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`p-2 rounded-full border border-white/10 backdrop-blur-md transition-all ${
                  isAutoRotating
                    ? 'bg-white/20 text-white'
                    : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title={isAutoRotating ? 'Pause auto-tour rotation' : 'Start auto-tour rotation'}
              >
                {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              {/* Ambient soundscape toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2 rounded-full border border-white/10 backdrop-blur-md transition-all ${
                  isPlayingAudio
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title={isPlayingAudio ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {mode === 'official-proxy' && (
            <button
              type="button"
              onClick={() => {
                setIframeKey((prev) => prev + 1);
                setIframeLoaded(false);
              }}
              className="p-2 bg-black/60 backdrop-blur-md hover:bg-white/10 text-neutral-300 hover:text-white rounded-full border border-white/10 transition-colors"
              title="Reload live viewer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href={directKretzUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-black/60 backdrop-blur-md hover:bg-white/10 text-neutral-300 hover:text-white rounded-full border border-white/10 transition-colors"
            title="Open official listing at kretzrealestate.com in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-black/60 backdrop-blur-md hover:bg-white/10 text-neutral-300 hover:text-white rounded-full border border-white/10 transition-colors"
            title="Toggle fullscreen immersive view"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* MODE 1: INTERACTIVE 360 WALKTHROUGH */}
        {mode === 'interactive' && (
          <div
            className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* 360 Simulated Panoramic Stage */}
            <div
              className="absolute inset-0 transition-transform duration-75 ease-out"
              style={{
                transform: `scale(${zoom * 1.15}) translate(${((yaw % 360) / 360) * -35}%, ${pitch * 0.45}%)`,
              }}
            >
              {/* High-resolution panoramic room image */}
              <img
                src={currentRoom.image}
                alt={currentRoom.name}
                className="w-[200%] h-[120%] -left-[50%] -top-[10%] object-cover object-center pointer-events-none filter brightness-95 contrast-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('files.kretzrealestate.com')) {
                    target.src = target.src.replace('https://files.kretzrealestate.com', '/files');
                  }
                }}
              />
            </div>

            {/* Depth vignette and subtle atmospheric lighting */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-lg"></div>

            {/* Dynamic Navigation Hotspots within the 360 scene */}
            {currentRoom.hotspots.map((hotspot, idx) => {
              // Calculate screen projection from hotspot yaw/pitch vs camera yaw/pitch
              let angleDiff = (hotspot.yaw - (yaw % 360) + 540) % 360 - 180;
              const isVisible = Math.abs(angleDiff) < 70;
              const screenX = 50 + (angleDiff / 70) * 45;
              const screenY = 50 - ((hotspot.pitch - pitch) / 45) * 35;

              if (!isVisible) return null;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentRoomIndex(hotspot.targetRoomId);
                  }}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 bg-black/60 backdrop-blur-md hover:bg-white hover:text-black text-white px-3 py-1.5 rounded-full border border-white/20 shadow-2xl transition-all duration-300 hover:scale-110"
                  style={{ left: `${screenX}%`, top: `${screenY}%` }}
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="text-xs font-medium tracking-wide whitespace-nowrap">
                    {hotspot.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black" />
                </button>
              );
            })}

            {/* Subtle Guidance Overlay (fades out when dragging) */}
            {showInfo && (
              <div className="absolute top-16 left-4 z-20 pointer-events-none max-w-xs animate-fadeIn">
                <div className="bg-black/70 backdrop-blur-md p-3.5 rounded-lg border border-white/10 shadow-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-serif-luxury">
                      Active Space
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInfo(false)}
                      className="pointer-events-auto text-neutral-400 hover:text-white"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-white font-serif-luxury">
                    {currentRoom.name}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Click and drag across the screen to pan 360°. Click any glowing navigation portal to step through the residence.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Room Carousel */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center space-x-2 overflow-x-auto py-1 px-2 bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-w-full scrollbar-none">
                <span className="text-[11px] font-mono text-neutral-400 px-2 uppercase tracking-wider hidden sm:inline">
                  Rooms:
                </span>
                {rooms.map((room, idx) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setCurrentRoomIndex(idx)}
                    className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      currentRoomIndex === idx
                        ? 'bg-white text-black font-semibold shadow-md scale-105'
                        : 'text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-5 h-5 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px]">{room.name}</span>
                  </button>
                ))}
              </div>

              {/* Prev / Next Room Buttons */}
              <div className="pointer-events-auto hidden sm:flex items-center space-x-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setCurrentRoomIndex((prev) => (prev - 1 + rooms.length) % rooms.length)}
                  className="p-2.5 bg-black/75 backdrop-blur-md hover:bg-white hover:text-black rounded-full border border-white/10 text-white transition-all shadow-xl"
                  title="Previous Space"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRoomIndex((prev) => (prev + 1) % rooms.length)}
                  className="p-2.5 bg-black/75 backdrop-blur-md hover:bg-white hover:text-black rounded-full border border-white/10 text-white transition-all shadow-xl"
                  title="Next Space"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: OFFICIAL PROXIED KRETZ VIEWER */}
        {mode === 'official-proxy' && (
          <div className="relative w-full h-full flex flex-col bg-[#111111]">
            {/* Proxy header banner */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-white/10 text-xs text-neutral-300">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-neutral-400">Proxied live from:</span>
                <span className="font-mono text-white text-[11px] truncate max-w-sm">
                  {directKretzUrl}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-[11px] text-neutral-400">
                  X-Frame-Options bypassed via local proxy
                </span>
                <a
                  href={directKretzUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-neutral-200 hover:text-white underline text-[11px]"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Iframe loading spinner */}
            {!iframeLoaded && (
              <div className="absolute inset-0 top-9 z-10 flex flex-col items-center justify-center bg-neutral-950/90 text-neutral-300 space-y-3">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <div className="text-xs font-serif-luxury tracking-widest uppercase text-neutral-400">
                  Connecting to Kretz Real Estate Virtual Viewer...
                </div>
              </div>
            )}

            {/* Proxied iframe */}
            <iframe
              key={iframeKey}
              src={officialTourUrl}
              title={`Kretz Real Estate Virtual Tour - ${property.ref}`}
              className="w-full flex-1 border-0 bg-neutral-950"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        )}

        {/* MODE 3: CINEMATIC HD VIDEO IMMERSION */}
        {mode === 'cinematic' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-2xl mx-auto">
              {/* Background ambient poster */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${rooms[0]?.image})` }}
              ></div>

              <div className="relative z-10 space-y-3">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs tracking-widest uppercase font-serif-luxury text-neutral-300 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Exclusive Cinematic Showcase</span>
                </span>

                <h3 className="text-2xl sm:text-3xl font-serif-luxury text-white">
                  {property.title}
                </h3>

                <p className="text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                  Experience a curated cinematic tour through {property.location}. High-definition drone vistas, architectural highlights, and interior suites.
                </p>
              </div>

              {/* Large Interactive Play/Watch trigger */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setMode('interactive')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 bg-white text-black hover:bg-neutral-200 font-semibold rounded-full shadow-2xl transition-all hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  <span>Launch 360° Walkthrough</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('official-proxy')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-medium rounded-full border border-white/20 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Stream Kretz Live Feed</span>
                </button>
              </div>

              {/* Specs pill badges */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/10 text-xs text-neutral-300">
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  {property.surface > 0 ? `${property.surface} m²` : property.typeDisplay}
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  {property.rooms > 0 ? `${property.rooms} Rooms` : 'Private Estate'}
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  Ref: {property.ref}
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-amber-300 font-semibold">
                  {property.priceFormatted}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
