'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserNotification } from '@/lib/notifications/types';

interface DashboardHeaderProps {
  userName: string;
  userEmail?: string | null;
  userRole?: string;
  userAvatar?: string | null;
  onSignOut: () => void;
  onSelectTab?: (tab: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userEmail,
  userRole = 'Learner',
  userAvatar,
  onSignOut,
  onSelectTab,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<UserNotification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch unread notifications
  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        setRecentNotifications((data.notifications || []).slice(0, 3));
      }
    } catch {
      // Ignore background sync failure
    }
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const initial = (userName || 'Learner').charAt(0).toUpperCase();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Sidebar Toggle & Search Input Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 360px', maxWidth: '520px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              {isSidebarCollapsed ? (
                <polyline points="14 15 17 12 14 9" />
              ) : (
                <polyline points="16 9 13 12 16 15" />
              )}
            </svg>
          </button>
        )}

        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            position: 'relative',
            margin: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '40px',
              backgroundColor: '#FFFFFF',
              border: isSearchFocused ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 12px',
              boxShadow: isSearchFocused
                ? '0 0 0 3px rgba(37, 99, 235, 0.12)'
                : '0 1px 2px rgba(15, 23, 42, 0.03)',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isSearchFocused ? '#2563EB' : '#94A3B8'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginRight: '8px' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search topics, courses, or concepts..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '0.84rem',
                color: '#0F172A',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              }}
            />

            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#94A3B8',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '2px 6px',
                borderRadius: '5px',
                flexShrink: 0,
                marginLeft: '6px',
                userSelect: 'none',
              }}
            >
              ⌘ K
            </span>
          </div>
        </form>
      </div>

      {/* Right: Notifications & Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Notifications Icon Button */}
        <div ref={notificationRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {/* Red unread dot - ONLY shown if unreadCount > 0 */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '9px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 0 2px #FFFFFF',
                }}
              />
            )}
          </button>

          {/* Quick Notifications Dropdown */}
          {showNotifications && (
            <div
              className="swallern-dropdown-enter"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '2px 4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EF4444', backgroundColor: '#FEF2F2', padding: '1px 6px', borderRadius: '9999px' }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {recentNotifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.targetRoute) router.push(n.targetRoute);
                        else router.push('/dashboard/notifications');
                      }}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: n.read ? '#FFFFFF' : '#F0F7FF',
                        border: `1px solid ${n.read ? '#F1F5F9' : '#DBEAFE'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 8px', textAlign: 'center', color: '#64748B', fontSize: '0.78rem' }}>
                  No recent notifications
                </div>
              )}

              <Link
                href="/dashboard/notifications"
                onClick={() => setShowNotifications(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '10px',
                  color: '#2563EB',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                View all in Notification Center →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((v) => !v)}
            aria-label="User Profile"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 10px 0 5px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
            )}

            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#2563EB' }}>
                {userRole}
              </div>
            </div>

            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* User Profile Dropdown */}
          {showProfileMenu && (
            <div
              className="swallern-dropdown-enter"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                zIndex: 100,
              }}
            >
              <div style={{ paddingBottom: '8px', marginBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>{userName}</div>
                {userEmail && (
                  <div style={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userEmail}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSelectTab) onSelectTab('settings');
                    else router.push('/dashboard?tab=settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Profile & Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/dashboard/notifications');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>Notifications</span>
                </button>

                <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
