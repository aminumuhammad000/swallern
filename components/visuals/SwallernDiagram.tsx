'use client';

import React from 'react';

interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
}

interface SwallernDiagramProps {
  title: string;
  nodes?: DiagramNode[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Swallern Educational Diagram — Swallern Visual System v1 (Mode B)
 * High-contrast textbook process diagram with clean node flows.
 */
export const SwallernDiagram: React.FC<SwallernDiagramProps> = ({
  title,
  nodes = [],
  className = '',
  style = {},
}) => {
  const defaultNodes: DiagramNode[] = [
    { id: '1', label: '1. Fact Extraction', sublabel: 'Verified Primary Sources', color: '#3B82F6' },
    { id: '2', label: '2. Core Concept Flow', sublabel: 'Structured Lesson Limits', color: '#0D9488' },
    { id: '3', label: '3. Knowledge Quiz', sublabel: 'Bite-Sized Active Recall', color: '#F59E0B' },
  ];

  const displayNodes = nodes.length > 0 ? nodes : defaultNodes;

  return (
    <div
      className={`swallern-diagram-card ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid var(--color-neutral-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
          MODE B — EDUCATIONAL DIAGRAM
        </span>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-dark)', margin: 0 }}>
          {title}
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#F8FAFC',
                borderLeft: `4px solid ${node.color || '#3B82F6'}`,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: node.color || '#3B82F6',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-dark)' }}>
                  {node.label}
                </div>
                {node.sublabel && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-gray)' }}>
                    {node.sublabel}
                  </div>
                )}
              </div>
            </div>
            {index < displayNodes.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                <span style={{ color: 'var(--color-neutral-gray)', fontSize: '14px', fontWeight: 800 }}>↓</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
