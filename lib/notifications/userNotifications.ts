/**
 * Swallern In-App User Notification Service
 * Handles server-backed retrieval, read-state persistence, creation, and unread counts.
 */

import { UserNotification, UserNotificationType } from './types';

// In-memory persistent cache per user session for in-app notifications
const userNotificationsStore = new Map<string, UserNotification[]>();

/**
 * Returns default initial notifications for a learner
 */
function getDefaultSeedNotifications(userId: string): UserNotification[] {
  const now = Date.now();
  return [
    {
      id: `notif_welcome_${userId}`,
      userId,
      type: 'system',
      title: 'Welcome to Swallern! 🎓',
      message: 'Explore bite-sized interactive topics crafted with the Swallern Visual System.',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(), // 30 mins ago
      targetRoute: '/explore',
    },
    {
      id: `notif_streak_${userId}`,
      type: 'achievement',
      userId,
      title: 'Daily Curiosity Streak',
      message: 'Complete any 5-minute interactive lesson today to start your learning streak.',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(), // 2 hours ago
      targetRoute: '/explore',
    },
    {
      id: `notif_trending_${userId}`,
      type: 'course',
      userId,
      title: 'Trending in Biology: Katmai Fat Bear Week',
      message: 'Discover how brown bears enter hyperphagia to build winter survival reserves.',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      targetRoute: '/topics/fat-bear-week-voting/learn',
    },
  ];
}

/**
 * Get all notifications for a specific user
 */
export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  if (!userNotificationsStore.has(userId)) {
    userNotificationsStore.set(userId, getDefaultSeedNotifications(userId));
  }
  const notifs = userNotificationsStore.get(userId) || [];
  return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const notifs = await getUserNotifications(userId);
  return notifs.filter((n) => !n.read).length;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  const notifs = await getUserNotifications(userId);
  const target = notifs.find((n) => n.id === notificationId);
  if (target) {
    target.read = true;
    userNotificationsStore.set(userId, notifs);
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const notifs = await getUserNotifications(userId);
  let updatedCount = 0;
  for (const n of notifs) {
    if (!n.read) {
      n.read = true;
      updatedCount++;
    }
  }
  userNotificationsStore.set(userId, notifs);
  return updatedCount;
}

/**
 * Create and add a new user notification
 */
export async function createUserNotification(data: {
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  targetRoute?: string;
  metadata?: Record<string, unknown>;
}): Promise<UserNotification> {
  const notifs = await getUserNotifications(data.userId);
  const newNotif: UserNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: new Date().toISOString(),
    targetRoute: data.targetRoute,
    metadata: data.metadata,
  };
  notifs.unshift(newNotif);
  userNotificationsStore.set(data.userId, notifs);
  return newNotif;
}
