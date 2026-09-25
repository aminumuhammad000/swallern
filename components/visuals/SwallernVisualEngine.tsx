'use client';

import React, { useState, useMemo } from 'react';
import { TopicThumbnail } from '@/components/dashboard/TopicThumbnail';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';

export interface VisualAssetItem {
  id: string;
  title: string;
  category: 'biology' | 'physics' | 'space' | 'technology' | 'neuroscience' | 'earth' | 'mascot';
  mediaType: 'ILLUSTRATION' | 'GIF' | 'DIAGRAM' | 'PHOTO';
  description: string;
  credit?: string;
  mode: 'A_ILLUSTRATION' | 'B_DIAGRAM' | 'C_REAL_WORLD' | 'D_MAP' | 'E_ANIMATION';
  characterId?: string;
  expression?: string;
  pose?: string;
}

export const VISUAL_ENGINE_LIBRARY: VisualAssetItem[] = [
  // 1. Biology & Nature
  {
    id: 'bio_bear_salmon_feed',
    title: 'Katmai Bear Salmon Hyperphagia',
    category: 'biology',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Dynamic animation of brown bear catching salmon at Brooks Falls to build winter energy.',
    credit: 'National Park Service / Swallern Engine',
  },
  {
    id: 'bio_photosynthesis_cycle',
    title: 'Chloroplast Photosynthesis Flow',
    category: 'biology',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Educational diagram showing sunlight, water, and CO2 conversion into glucose and oxygen.',
    credit: 'Swallern Educational Diagrams',
  },
  {
    id: 'bio_dna_replication',
    title: 'DNA Double Helix Unwinding',
    category: 'biology',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    description: 'Soft vector illustration of DNA helicase enzyme splitting nucleotide base pairs.',
    credit: 'Swallern Bio Illustration',
  },
  {
    id: 'bio_cellular_mitosis',
    title: 'Cellular Division & Mitosis',
    category: 'biology',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Animated step-by-step visual of chromosome alignment and cell duplication.',
    credit: 'Swallern Animation Labs',
  },

  // 2. Physics & Chemistry
  {
    id: 'phys_rayleigh_scattering',
    title: 'Atmospheric Rayleigh Scattering',
    category: 'physics',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Diagram demonstrating how short blue wavelengths disperse across nitrogen molecules.',
    credit: 'Swallern Physics Lab',
  },
  {
    id: 'phys_quantum_superposition',
    title: 'Quantum Qubit Superposition',
    category: 'physics',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Animated Bloch sphere illustrating simultaneous 0 and 1 computational states.',
    credit: 'Swallern Quantum Studio',
  },
  {
    id: 'phys_light_prism_refraction',
    title: 'Prism Light Dispersion',
    category: 'physics',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    description: 'White light refracting through glass into rainbow spectral wavelengths.',
    credit: 'Swallern Optics',
  },

  // 3. Space & Astronomy
  {
    id: 'space_black_hole_horizon',
    title: 'Black Hole Event Horizon',
    category: 'space',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Swirling accretion disk simulation where light bends around gravitational singularity.',
    credit: 'Astrophysics Visual Archive',
  },
  {
    id: 'space_solar_system_orbits',
    title: 'Solar System Planetary Orbits',
    category: 'space',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Scale diagram of inner terrestrial planets and outer gas giants orbiting the Sun.',
    credit: 'NASA / Swallern Astronomy',
  },
  {
    id: 'space_jwst_deep_field',
    title: 'James Webb Cosmic Deep Field',
    category: 'space',
    mediaType: 'PHOTO',
    mode: 'C_REAL_WORLD',
    description: 'Infrared real-world observation of gravitational lensing in galaxy cluster SMACS 0723.',
    credit: 'NASA, ESA, CSA, STScI',
  },

  // 4. Technology & Computer Science
  {
    id: 'tech_tcp_ip_packets',
    title: 'TCP/IP Packet Routing Network',
    category: 'technology',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Data packet switching across global undersea fiber optic backbones and DNS servers.',
    credit: 'Swallern Systems Engineering',
  },
  {
    id: 'tech_neural_network_layers',
    title: 'Deep Neural Network Architecture',
    category: 'technology',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Input, hidden, and output tensor nodes passing activation weights in machine learning.',
    credit: 'Swallern AI Visuals',
  },
  {
    id: 'tech_fiber_optic_internal',
    title: 'Fiber Optic Total Internal Reflection',
    category: 'technology',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    description: 'Light pulses bouncing inside high-purity glass core with zero signal degradation.',
    credit: 'Swallern Tech Diagrams',
  },

  // 5. Neuroscience & Brain
  {
    id: 'neuro_synaptic_plasticity',
    title: 'Synaptic Plasticity & Memory',
    category: 'neuroscience',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    description: 'Neurotransmitters diffusing across synaptic cleft during long-term potentiation.',
    credit: 'Cognitive Science Archive',
  },
  {
    id: 'neuro_human_brain_lobes',
    title: 'Cerebral Cortex Functional Lobes',
    category: 'neuroscience',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Color-coded map of frontal, parietal, occipital, and temporal cognitive regions.',
    credit: 'Swallern Medical Anatomy',
  },

  // 6. Earth Science & Environment
  {
    id: 'earth_axial_tilt_seasons',
    title: 'Earth 23.5 Degree Axial Tilt & Seasons',
    category: 'earth',
    mediaType: 'DIAGRAM',
    mode: 'B_DIAGRAM',
    description: 'Solar incidence angle causing summer solstices and winter solstices across hemispheres.',
    credit: 'NOAA / Swallern Earth Lab',
  },
  {
    id: 'earth_water_cycle_flow',
    title: 'Hydrologic Water Cycle',
    category: 'earth',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    description: 'Evaporation, atmospheric condensation, precipitation, and groundwater infiltration.',
    credit: 'Swallern Climate Visuals',
  },

  // 7. Swallern Mascot Poses
  {
    id: 'mascot_bear_reading',
    title: 'Swallern Bear Reading & Studying',
    category: 'mascot',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    characterId: 'swallern_bear_v1',
    expression: 'focused',
    pose: 'reading',
    description: 'Canonical mascot sitting with open book, blue backpack, and studious expression.',
    credit: 'Swallern Visual System v1',
  },
  {
    id: 'mascot_bear_celebrating',
    title: 'Swallern Bear Knowledge Victory',
    category: 'mascot',
    mediaType: 'GIF',
    mode: 'E_ANIMATION',
    characterId: 'swallern_bear_v1',
    expression: 'excited',
    pose: 'celebrating',
    description: 'Joyful mascot celebrating successful quiz completion or lesson milestone.',
    credit: 'Swallern Visual System v1',
  },
  {
    id: 'mascot_bear_curious',
    title: 'Swallern Bear Curious Inquiry',
    category: 'mascot',
    mediaType: 'ILLUSTRATION',
    mode: 'A_ILLUSTRATION',
    characterId: 'swallern_bear_v1',
    expression: 'curious',
    pose: 'standing',
    description: 'Approachable mascot exploring new ideas with friendly inquisitive posture.',
    credit: 'Swallern Visual System v1',
  },
];

interface SwallernVisualEngineProps {
  selectedAssetId?: string;
  onSelectVisual: (asset: VisualAssetItem) => void;
  onCustomUpload?: (file: File) => void;
  activeLessonTitle?: string;
}

export const SwallernVisualEngine: React.FC<SwallernVisualEngineProps> = ({
  selectedAssetId,
  onSelectVisual,
  onCustomUpload,
  activeLessonTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all');
  const [customFile, setCustomFile] = useState<File | null>(null);

  // Filter visuals based on search, category, and media type
  const filteredAssets = useMemo(() => {
    return VISUAL_ENGINE_LIBRARY.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.mediaType.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesType =
        selectedMediaType === 'all' || item.mediaType === selectedMediaType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedMediaType]);

  const activeAsset = useMemo(() => {
    return (
      VISUAL_ENGINE_LIBRARY.find((a) => a.id === selectedAssetId) ||
      VISUAL_ENGINE_LIBRARY[0]
    );
  }, [selectedAssetId]);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #E2E8F0',
        padding: '1.5rem',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
              }}
            >
              Swallern Visual Engine
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              v1.0 Library
            </span>
          </div>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#64748B',
              margin: '3px 0 0 0',
              fontWeight: 500,
            }}
          >
            {activeLessonTitle
              ? `Select educational visual or GIF for "${activeLessonTitle}".`
              : 'Search and scroll to assign interactive visuals, diagrams, and GIFs to lessons.'}
          </p>
        </div>

        {/* Media type count badge */}
        <div
          style={{
            fontSize: '0.78rem',
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '4px 10px',
            borderRadius: '10px',
            fontWeight: 600,
          }}
        >
          {filteredAssets.length} visuals available
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            padding: '0 12px',
            height: '42px',
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '10px', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search visual engine by keyword, topic, or media type (e.g. bear, space, internet, diagram, gif)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.85rem',
              color: '#0F172A',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginRight: '4px' }}>
          Filters:
        </span>

        {[
          { key: 'all', label: 'All Media' },
          { key: 'GIF', label: 'GIF / Animation' },
          { key: 'ILLUSTRATION', label: 'Illustrations' },
          { key: 'DIAGRAM', label: 'Diagrams' },
          { key: 'PHOTO', label: 'Photos' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSelectedMediaType(t.key)}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: selectedMediaType === t.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: selectedMediaType === t.key ? '#EFF6FF' : '#FFFFFF',
              color: selectedMediaType === t.key ? '#2563EB' : '#475569',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            {t.label}
          </button>
        ))}

        <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />

        {[
          { key: 'all', label: 'All Subjects' },
          { key: 'biology', label: 'Biology' },
          { key: 'space', label: 'Space' },
          { key: 'physics', label: 'Physics' },
          { key: 'technology', label: 'Tech' },
          { key: 'neuroscience', label: 'Brain' },
          { key: 'earth', label: 'Earth' },
          { key: 'mascot', label: 'Swallern Mascot' },
        ].map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setSelectedCategory(c.key)}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: selectedCategory === c.key ? '1px solid #0D9488' : '1px solid #E2E8F0',
              backgroundColor: selectedCategory === c.key ? '#F0FDFA' : '#FFFFFF',
              color: selectedCategory === c.key ? '#0D9488' : '#64748B',
              fontWeight: 600,
              fontSize: '0.74rem',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Visual Engine Layout: Grid on Left + Live Preview on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.85fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Scrollable Visual Grid */}
        <div
          className="swallern-scrollbar"
          style={{
            maxHeight: '440px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}
        >
          {filteredAssets.length === 0 ? (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                border: '1.5px dashed #CBD5E1',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                No visuals match your search
              </div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Try broader keywords like &quot;bear&quot;, &quot;space&quot;, &quot;packet&quot;, or clear filters.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectVisual(asset)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                      padding: '10px',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected
                        ? '0 0 0 3px rgba(37, 99, 235, 0.15)'
                        : '0 1px 3px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#93C5FD';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div>
                      {/* Thumbnail Art */}
                      <div
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '8px',
                          height: '92px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F8FAFC',
                          position: 'relative',
                        }}
                      >
                        {asset.category === 'mascot' ? (
                          <SwallernCharacter
                            size={72}
                            expression={(asset.expression as any) || 'happy'}
                            pose={(asset.pose as any) || 'standing'}
                          />
                        ) : (
                          <TopicThumbnail
                            category={asset.category}
                            size="sm"
                            height="92px"
                          />
                        )}

                        {/* Media type badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor:
                              asset.mediaType === 'GIF'
                                ? '#EF4444'
                                : asset.mediaType === 'DIAGRAM'
                                ? '#0D9488'
                                : '#2563EB',
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        >
                          {asset.mediaType}
                        </span>

                        {/* Selected Indicator Checkmark */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#2563EB',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          lineHeight: 1.3,
                          marginBottom: '4px',
                        }}
                      >
                        {asset.title}
                      </div>

                      {/* Brief description */}
                      <p
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {asset.description}
                      </p>
                    </div>

                    {/* Bottom select button */}
                    <button
                      type="button"
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        backgroundColor: isSelected ? '#2563EB' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {isSelected ? 'Selected' : 'Use Visual'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Visual Focus Card & Custom Upload */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Active Visual Selection
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#E0E7FF',
                color: '#3730A3',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              {activeAsset.mode}
            </span>
          </div>

          {/* Large Preview Canvas */}
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              height: '140px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {activeAsset.category === 'mascot' ? (
              <SwallernCharacter
                size={110}
                expression={(activeAsset.expression as any) || 'happy'}
                pose={(activeAsset.pose as any) || 'standing'}
              />
            ) : (
              <TopicThumbnail
                category={activeAsset.category}
                size="lg"
                height="140px"
              />
            )}
          </div>

          {/* Detail specs */}
          <div>
            <h4
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 4px 0',
              }}
            >
              {activeAsset.title}
            </h4>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748B',
                margin: '0 0 8px 0',
                lineHeight: 1.45,
              }}
            >
              {activeAsset.description}
            </p>
            {activeAsset.credit && (
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                Attribution: {activeAsset.credit}
              </div>
            )}
          </div>

          {/* Custom Upload Drop Option */}
          <div
            style={{
              marginTop: '4px',
              paddingTop: '10px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '6px',
              }}
            >
              Or upload your custom GIF/Image
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #CBD5E1',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{customFile ? customFile.name : 'Upload Local Image / GIF'}</span>
              <input
                type="file"
                accept="image/*,image/gif"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setCustomFile(f);
                    onCustomUpload?.(f);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
