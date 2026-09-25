'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';

export type DashboardNavTab =
  | 'home'
  | 'discover'
  | 'my-learning'
  | 'notifications'
  | 'create'
  | 'courses'
  | 'notes'
  | 'bookmarks'
  | 'progress'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardNavTab | string;
  onSelectTab: (tab: DashboardNavTab) => void;
  savedCount?: number;
  completedCount?: number;
  unreadNotificationsCount?: number;
  onOpenCreateModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0,
  completedCount = 0,
  unreadNotificationsCount,
  onOpenCreateModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [liveUnread, setLiveUnread] = useState(unreadNotificationsCount || 0);

  useEffect(() => {
    if (unreadNotificationsCount !== undefined) {
      setLiveUnread(unreadNotificationsCount);
      return;
    }
    // Fetch live unread count
    fetch('/api/user/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.unreadCount === 'number') {
          setLiveUnread(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [unreadNotificationsCount]);

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: '12px',
    width: '100%',
    padding: isCollapsed ? '10px 0' : '9px 12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
    color: isActive ? '#2563EB' : '#475569',
    fontWeight: isActive ? 700 : 600,
    fontSize: '0.86rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 120ms ease',
    outline: 'none',
    position: 'relative',
  });

  return (
    <aside
      className="swallern-scrollbar"
      style={{
        width: isCollapsed ? '72px' : '230px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '18px 8px' : '20px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 180ms cubic-bezier(0.4, 0, 0.2, 1), padding 180ms ease',
      }}
    >
      <div>
        {/* Swallern Brand Logo & Toggle Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0 0 16px 0' : '2px 6px 20px 6px',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              textDecoration: 'none',
            }}
            title="Swallern"
          >
            {/* Bear Mascot Icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <circle cx="12" cy="12" r="6" fill="#6366F1" />
                <circle cx="28" cy="12" r="6" fill="#6366F1" />
                <circle cx="12" cy="12" r="3.5" fill="#A5B4FC" />
                <circle cx="28" cy="12" r="3.5" fill="#A5B4FC" />
                <circle cx="20" cy="22" r="14" fill="#6366F1" />
                <ellipse cx="20" cy="24" rx="8" ry="6" fill="#EEF2FF" />
                <circle cx="15.5" cy="19" r="2" fill="#0F172A" />
                <circle cx="24.5" cy="19" r="2" fill="#0F172A" />
                <ellipse cx="20" cy="23" rx="3" ry="2" fill="#0F172A" />
              </svg>
            </div>
            {!isCollapsed && (
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Swallern
              </span>
            )}
          </Link>

          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '7px',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {isCollapsed && onToggleCollapse && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '7px',
                width: '28px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Primary Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Home */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            style={navItemStyle(activeTab === 'home')}
            title="Home"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {!isCollapsed && <span>Home</span>}
          </button>

          {/* Discover (Navigates out to Explore) */}
          <button
            type="button"
            onClick={() => onSelectTab('discover')}
            style={navItemStyle(activeTab === 'discover')}
            title="Discover"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {!isCollapsed && <span>Discover</span>}
          </button>

          {/* My Learning */}
          <button
            type="button"
            onClick={() => onSelectTab('my-learning')}
            style={navItemStyle(activeTab === 'my-learning')}
            title="My Learning"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {!isCollapsed && <span>My Learning</span>}
          </button>

          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            style={{ textDecoration: 'none' }}
          >
            <button
              type="button"
              style={navItemStyle(activeTab === 'notifications')}
              title={isCollapsed ? `Notifications (${liveUnread})` : 'Notifications'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {!isCollapsed && <span>Notifications</span>}
              {liveUnread > 0 && (
                isCollapsed ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '10px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      border: '1px solid #FECACA',
                    }}
                  >
                    {liveUnread}
                  </span>
                )
              )}
            </button>
          </Link>

          {/* Create Topic / Course */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCreateModal) onOpenCreateModal();
              onSelectTab('create');
            }}
            style={navItemStyle(activeTab === 'create')}
            title="Create Topic"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {!isCollapsed && <span>Create Topic</span>}
          </button>
        </nav>

        {/* Learning Tools Header / Divider */}
        {isCollapsed ? (
          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '14px 6px' }} />
        ) : (
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '20px 10px 8px 10px',
            }}
          >
            Learning Tools
          </div>
        )}

        {/* Secondary Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Notes */}
          <button
            type="button"
            onClick={() => onSelectTab('notes')}
            style={navItemStyle(activeTab === 'notes')}
            title="Notes"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {!isCollapsed && <span>Study Notes</span>}
          </button>

          {/* Bookmarks */}
          <button
            type="button"
            onClick={() => onSelectTab('bookmarks')}
            style={navItemStyle(activeTab === 'bookmarks')}
            title={isCollapsed ? `Bookmarks (${savedCount})` : 'Bookmarks'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {!isCollapsed && <span>Saved Topics</span>}
            {savedCount > 0 && (
              isCollapsed ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                  }}
                />
              ) : (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563EB',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {savedCount}
                </span>
              )
            )}
          </button>

          {/* Progress */}
          <button
            type="button"
            onClick={() => onSelectTab('progress')}
            style={navItemStyle(activeTab === 'progress')}
            title={isCollapsed ? `Progress (${completedCount})` : 'Progress'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            {!isCollapsed && <span>Activity Log</span>}
            {completedCount > 0 && (
              isCollapsed ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                />
              ) : (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    color: '#059669',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {completedCount}
                </span>
              )
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            style={navItemStyle(activeTab === 'settings')}
            title="Settings"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {!isCollapsed && <span>Settings</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Mascot Card */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
        }}
      >
        {!isCollapsed ? (
          <div
            style={{
              background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
              borderRadius: '14px',
              padding: '10px',
              position: 'relative',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#475569',
                lineHeight: 1.3,
                marginBottom: '6px',
                border: '1px solid #E2E8F0',
              }}
            >
              Curiosity creates knowledge.
              <div style={{ color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>
                Keep exploring!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SwallernCharacter
                expression="focused"
                pose="reading"
                size={74}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '4px 0',
              cursor: 'pointer',
            }}
            onClick={onToggleCollapse}
            title="Expand sidebar"
          >
            <SwallernCharacter
              expression="focused"
              pose="standing"
              size={36}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
