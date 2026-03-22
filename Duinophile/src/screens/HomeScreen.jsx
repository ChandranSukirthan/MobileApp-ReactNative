import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/colors';
import PostCard from '../components/PostCard';
import { getAllPosts } from '../services/postService';

const DEMO_USER_ID = '507f1f77bcf86cd799439011';

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const data = await getAllPosts();
      setPosts(data || []);
    } catch (err) {
      setError('Failed to load posts. Check your connection.');
      // Demo data when API is not available
      setPosts([
        {
          _id: '1',
          title: 'My First Arduino Project',
          description: 'Built a LED blinker with Arduino Uno!',
          achievementType: 'ARDUINO_TASK',
          level: 1,
          likes: [],
          comments: [],
          isPublic: true,
          createdAt: new Date().toISOString(),
          user: { name: 'Sukirthan', avatar: null },
        },
        {
          _id: '2',
          title: '7 Day Learning Streak!',
          description: 'Completed 7 consecutive days of Arduino learning.',
          achievementType: 'STREAK_7',
          level: 7,
          likes: [],
          comments: [{ text: 'Amazing!' }],
          isPublic: true,
          createdAt: new Date().toISOString(),
          user: { name: 'Arun', avatar: null },
        },
        {
          _id: '3',
          title: 'Hardware Challenge Complete',
          description: 'Built a temperature sensor circuit!',
          achievementType: 'HARDWARE_CHALLENGE',
          level: 5,
          likes: [],
          comments: [],
          isPublic: true,
          createdAt: new Date().toISOString(),
          user: { name: 'Priya', avatar: null },
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const handlePostPress = post => {
    navigation.navigate('PostDetail', { post, userId: DEMO_USER_ID });
  };

  const renderHeader = () => (
    <View style={styles.heroSection}>
      {/* Top badge */}
      <View style={styles.topBadge}>
        <Text style={styles.topBadgeText}>⚡ ARDUINO LEARNING COMMUNITY</Text>
      </View>

      {/* Hero text */}
      <Text style={styles.heroTitle}>Build. Learn.</Text>
      <Text style={styles.heroTitleBlue}>Track your progress.</Text>
      <Text style={styles.heroSubtitle}>
        Track your Arduino journey, celebrate milestones and connect with a
        community of makers and learners.
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('CreatePost')}>
        <Text style={styles.primaryBtnText}>✏️  Share Achievement</Text>
      </TouchableOpacity>

      {/* Feature pills */}
      <View style={styles.featurePills}>
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>⭐</Text>
          <View>
            <Text style={styles.pillLabel}>ACHIEVEMENTS</Text>
            <Text style={styles.pillValue}>Streaks & modules</Text>
          </View>
        </View>
        <View style={styles.pillDivider} />
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>🔧</Text>
          <View>
            <Text style={styles.pillLabel}>PROJECT PHOTOS</Text>
            <Text style={styles.pillValue}>Hardware builds</Text>
          </View>
        </View>
        <View style={styles.pillDivider} />
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>💬</Text>
          <View>
            <Text style={styles.pillLabel}>COMMUNITY</Text>
            <Text style={styles.pillValue}>Reactions & comments</Text>
          </View>
        </View>
      </View>

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          Explore what learners are building with Arduino across the community.
        </Text>
      </View>

      {/* Achievement type cards */}
      <View style={styles.achievementCards}>
        <View style={[styles.achievementCard, { borderTopColor: '#22C55E' }]}>
          <Text style={styles.achievementIcon}>⚡</Text>
          <Text style={styles.achievementCardTitle}>Daily Streaks</Text>
          <Text style={styles.achievementCardDesc}>
            Stay motivated with 7-day and 30-day learning streaks.
          </Text>
        </View>
        <View style={[styles.achievementCard, { borderTopColor: '#8B5CF6' }]}>
          <Text style={styles.achievementIcon}>🔧</Text>
          <Text style={styles.achievementCardTitle}>Hardware Builds</Text>
          <Text style={styles.achievementCardDesc}>
            Share photos from your Arduino projects.
          </Text>
        </View>
        <View style={[styles.achievementCard, { borderTopColor: '#F59E0B' }]}>
          <Text style={styles.achievementIcon}>🏆</Text>
          <Text style={styles.achievementCardTitle}>Milestones</Text>
          <Text style={styles.achievementCardDesc}>
            Celebrate completed modules and course milestones.
          </Text>
        </View>
      </View>

      {/* Posts section title */}
      <Text style={styles.postsTitle}>Latest Posts</Text>
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navLogo}>
          <View style={styles.logoBolt}>
            <Text style={styles.logoBoltText}>⚡</Text>
          </View>
          <Text style={styles.logoText}>Duinophile</Text>
        </View>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => navigation.navigate('CreatePost')}>
          <Text style={styles.shareBtnText}>+ Share Achievement</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            userId={DEMO_USER_ID}
            onPress={handlePostPress}
            showDelete={false}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share an achievement!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.blue]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBolt: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBoltText: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    backgroundColor: COLORS.background,
    padding: 16,
  },
  topBadge: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
  },
  heroTitleBlue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.blue,
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryBtnText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  featurePills: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillIcon: {
    fontSize: 18,
  },
  pillLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pillValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  pillDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  achievementCards: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  achievementCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  achievementCardDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.warning,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default HomeScreen;