import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  RefreshControl,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../utils/Enums';
import TopHeader from '../../components/TopHeader';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useInfiniteQuery } from '@tanstack/react-query';
import AppLoader from '../../components/AppLoader';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const PAGE_LIMIT = 10;

// ─────────────────────────── Design Tokens ───────────────────────────
const FONT_SIZES = {
  xs: isTablet ? 13 : 11,
  sm: isTablet ? 15 : 13,
  md: isTablet ? 17 : 15,
  lg: isTablet ? 20 : 17,
  xl: isTablet ? 24 : 20,
  xxl: isTablet ? 30 : 26,
};

const SPACING = {
  xs: isTablet ? 6 : 4,
  sm: isTablet ? 10 : 8,
  md: isTablet ? 18 : 14,
  lg: isTablet ? 24 : 20,
  xl: isTablet ? 32 : 26,
};

// ─────────────────────────── Types ───────────────────────────
interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  body: string;
  image: string | null;
  data: Record<string, any>;
  sent: number;
  failed: number;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: NotificationItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// ─────────────────────────── Helpers ───────────────────────────
function timeAgo(isoString: string): string {
  const now = Date.now();
  const diff = now - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getNotificationIcon(type?: string): string {
  switch (type) {
    case 'booking_confirmed':
      return '🎉';
    case 'driver_enroute':
      return '🚗';
    case 'promotion':
      return '✨';
    case 'trip_completed':
      return '✅';
    case 'payment':
      return '💳';
    case 'system_alert':
      return '⚠️';
    case 'feature_announcement':
      return '🎩';
    case 'security':
      return '🔐';
    default:
      return '🔔';
  }
}

function getIconBg(type?: string): string {
  switch (type) {
    case 'booking_confirmed':
      return '#FFF3D6';
    case 'driver_enroute':
      return '#E8F5E9';
    case 'promotion':
      return '#FFF8E1';
    case 'trip_completed':
      return '#E8F5E9';
    case 'payment':
      return '#E3F2FD';
    case 'system_alert':
      return '#FFF3E0';
    case 'feature_announcement':
      return '#F3E5F5';
    case 'security':
      return '#FFEBEE';
    default:
      return '#F5F5F5';
  }
}

// ─────────────────────────── Notification Card ───────────────────────────
interface NotificationCardProps {
  item: NotificationItem;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const NotificationCard = memo(
  ({ item, onDismiss, onMarkRead }: NotificationCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scaleY = useRef(new Animated.Value(1)).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const entranceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(entranceAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    }, []);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
        onPanResponderMove: (_, g) => {
          translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: g.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(scaleY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => onDismiss(item._id));
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 8,
            }).start();
          }
        },
      }),
    ).current;

    const handlePress = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(prev => !prev);
      if (!item.read) onMarkRead(item._id);
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.98,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
      ]).start();
    }, [expanded, item.read]);

    const swipeHintLeft = translateX.interpolate({
      inputRange: [-SCREEN_WIDTH, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    const swipeHintRight = translateX.interpolate({
      inputRange: [0, SCREEN_WIDTH],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const notifType = item.data?.type;

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: Animated.multiply(opacity, entranceAnim),
            transform: [
              { translateX },
              { scaleX: scaleY },
              { scaleY },
              {
                scale: Animated.multiply(
                  cardScale,
                  entranceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                ),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[styles.swipeBgRight, { opacity: swipeHintLeft }]}
        >
          <Text style={styles.swipeText}>🗑️ Dismiss</Text>
        </Animated.View>
        <Animated.View
          style={[styles.swipeBgLeft, { opacity: swipeHintRight }]}
        >
          <Text style={[styles.swipeText, { color: COLORS.warning }]}>
            ✓ Mark Read
          </Text>
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          {...panResponder.panHandlers}
        >
          <View style={[styles.card, !item.read && styles.cardUnread]}>
            {/* {!item.read && <View style={styles.unreadBar} />} */}

            <View style={styles.cardInner}>
              {/* Icon / Avatar */}
              <View style={styles.iconCol}>
                {item.image ? (
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: item.image }} style={styles.avatar} />
                    <View style={styles.avatarBadge}>
                      <Text style={styles.avatarBadgeText}>
                        {getNotificationIcon(notifType)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.iconBubble,
                      { backgroundColor: getIconBg(notifType) },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>
                      {getNotificationIcon(notifType)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      !item.read && styles.cardTitleUnread,
                    ]}
                    numberOfLines={expanded ? undefined : 1}
                  >
                    {item.title}
                  </Text>
                  {/* {!item.read && <View style={styles.unreadDot} />} */}
                </View>

                <Text
                  style={styles.cardBody}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {item.body}
                </Text>

                {(item.sent > 1 || item.failed > 0) && (
                  <View style={styles.statsRow}>
                    {item.sent > 0 && (
                      <View style={styles.statChip}>
                        <Text
                          style={[styles.statText, { color: COLORS.success }]}
                        >
                          ✓ {item.sent} sent
                        </Text>
                      </View>
                    )}
                    {item.failed > 0 && (
                      <View style={[styles.statChip, styles.statChipFail]}>
                        <Text
                          style={[styles.statText, { color: COLORS.error }]}
                        >
                          ✗ {item.failed} failed
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.footerRow}>
                  <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
                  <TouchableOpacity
                    style={styles.expandBtn}
                    onPress={handlePress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.expandBtnText}>
                      {expanded ? '▲ Less' : '▼ More'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// ─────────────────────────── Section Header ───────────────────────────
const SectionHeader = memo(({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
));

// ─────────────────────────── Footer Loader ───────────────────────────
const FooterLoader = memo(() => (
  <View style={styles.footerLoader}>
    <ActivityIndicator size="small" color={COLORS.warning} />
    <Text style={styles.footerLoaderText}>Loading more...</Text>
  </View>
));

// ─────────────────────────── Empty State ───────────────────────────
const EmptyState = () => {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <View style={styles.emptyState}>
      <Animated.Text style={[styles.emptyIcon]}>🔔</Animated.Text>
      <Text style={styles.emptyTitle}>All Clear!</Text>
      <Text style={styles.emptyBody}>
        You don't have any notifications yet. We'll let you know when something
        comes up.
      </Text>
    </View>
  );
};

// ─────────────────────────── Main Screen ───────────────────────────
export default function NotificationsScreen({ navigation }: any) {
  const [localNotifications, setLocalNotifications] = useState<
    NotificationItem[]
  >([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const headerAnim = useRef(new Animated.Value(0)).current;

  // ── useInfiniteQuery replaces useQuery ──────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['user-notifications'],
    queryFn: ({ pageParam = 1 }) =>
      fetchData(
        `/notification/user?page=${pageParam}&limit=${PAGE_LIMIT}`,
      ) as Promise<ApiResponse>,

    // Tell React Query how to derive the next page number from the last response.
    // Return undefined when we're on the last page — that sets hasNextPage = false.
    getNextPageParam: (lastPage: ApiResponse) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });

  // Flatten pages → single array and keep local state in sync
  useEffect(() => {
    if (data?.pages) {
      const all = data.pages.flatMap(page => page.data ?? []);
      setLocalNotifications(all);
    }
  }, [data]);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────
  // Called by FlatList's onEndReached
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDismiss = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalNotifications(prev => prev.filter(n => n._id !== id));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ── Filter & Group ───────────────────────────────────────────────────
  const filteredData =
    filter === 'unread'
      ? localNotifications.filter(n => !n.read)
      : localNotifications;

  const unreadCount = localNotifications.filter(n => !n.read).length;
  const totalItems = data?.pages?.[0]?.totalItems ?? 0;

  const now = Date.now();
  const today: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];
  filteredData.forEach(n => {
    const diff = now - new Date(n.createdAt).getTime();
    if (diff < 24 * 60 * 60 * 1000) today.push(n);
    else earlier.push(n);
  });

  type ListItem =
    | { type: 'header'; label: string; key: string }
    | { type: 'notification'; data: NotificationItem; key: string };

  const listData: ListItem[] = [];
  if (today.length) {
    listData.push({ type: 'header', label: 'Today', key: 'h-today' });
    today.forEach(n =>
      listData.push({ type: 'notification', data: n, key: n._id }),
    );
  }
  if (earlier.length) {
    listData.push({ type: 'header', label: 'Earlier', key: 'h-earlier' });
    earlier.forEach(n =>
      listData.push({ type: 'notification', data: n, key: n._id }),
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') return <SectionHeader label={item.label} />;
      return (
        <NotificationCard
          item={item.data}
          onDismiss={handleDismiss}
          onMarkRead={handleMarkRead}
        />
      );
    },
    [handleDismiss, handleMarkRead],
  );

  if (isLoading) return <AppLoader />;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <TopHeader title="Notifications" navigation={navigation} />

      {/* ── Filter Bar ── */}
      {/* <Animated.View
        style={[
          styles.filterContainer,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }),
            }],
          },
        ]}
      >
        <View style={styles.filterRow}>
          {(['all', 'unread'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? `All  ${totalItems}` : `Unread  ${unreadCount}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </Animated.View> */}

      {/* ── Notification List ── */}
      <FlatList
        data={listData}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          listData.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        // ── Infinite scroll ──────────────────────────────────────────
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4} // fire when user is 40% from the bottom
        ListFooterComponent={
          isFetchingNextPage ? (
            <FooterLoader />
          ) : !hasNextPage && listData.length > 0 ? (
            <View style={styles.endOfList}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>
                {totalItems} notification{totalItems !== 1 ? 's' : ''} total
              </Text>
              <View style={styles.endLine} />
            </View>
          ) : null
        }
        // ────────────────────────────────────────────────────────────

        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={COLORS.warning}
            colors={[COLORS.warning]}
          />
        }
        ListEmptyComponent={<EmptyState />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
      />
    </View>
  );
}

// ─────────────────────────── Styles ───────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Filter bar
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  markAllBtn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warningDark,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: isTablet ? 40 : 30,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  // Card wrapper
  cardWrapper: {
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  swipeBgRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFEBEE',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: SPACING.xl,
  },
  swipeBgLeft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.warningLight,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: SPACING.xl,
  },
  swipeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.error,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: {
    borderColor: COLORS.warning + '55',
    shadowColor: COLORS.warning,
    shadowOpacity: 0.12,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.warning,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardInner: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  iconCol: { alignItems: 'center' },
  iconBubble: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: isTablet ? 24 : 20 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    backgroundColor: COLORS.border,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatarBadgeText: { fontSize: 10 },
  contentCol: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.3,
  },
  cardTitleUnread: { fontWeight: '700', color: COLORS.accent },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
    flexShrink: 0,
  },
  cardBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.5,
    fontFamily: 'Poppins-Regular',
  },
  statsRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  statChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statChipFail: { backgroundColor: '#FFEBEE' },
  statText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'Poppins-Regular',
  },
  expandBtn: { paddingHorizontal: 4 },
  expandBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontFamily: 'Poppins-Regular',
  },

  // Footer loader (shown while fetching next page)
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  footerLoaderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'Poppins-Regular',
  },

  // End-of-list divider
  endOfList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  endLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  endText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'Poppins-Regular',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Regular',
    color: COLORS.accent,
  },
  emptyBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.sm * 1.6,
    maxWidth: SCREEN_WIDTH * 0.7,
    fontFamily: 'Poppins-Regular',
  },
});
