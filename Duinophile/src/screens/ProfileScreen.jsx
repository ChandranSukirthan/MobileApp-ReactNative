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
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import PostCard from '../components/PostCard';
import DeleteModal from '../components/DeleteModal';
import { getPostsByUser, deletePost } from '../services/postService';
import { getInitials } from '../utils/helpers';

const DEMO_USER = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Sukirthan',
  email: 'sukirthan@gmail.com',
  bio: 'Arduino enthusiast & maker',
  streak: 7,
};

const ProfileScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUserPosts = async () => {
    try {
      const data = await getPostsByUser(DEMO_USER._id);
      setPosts(data || []);
    } catch (error) {
      // Demo data
      setPosts([
        {
          _id: '1',
          title: 'My Arduino LED Project',
          description: 'Built a cool LED matrix display!',
          achievementType: 'MODULE_COMPLETED',
          level: 77,
          likes: [],
          comments: [],
          isPublic: true,
          createdAt: new Date('2026-03-06T20:21:00').toISOString(),
          user: DEMO_USER,
        },
        {
          _id: '2',
          title: 'Hardware Challenge Done!',
          description: 'Completed the temperature sensor challenge.',
          achievementType: 'MODULE_COMPLETED',
          level: 23,
          likes: [1, 2, 3, 4],
          comments: [{ text: 'Great job!' }],
          isPublic: true,
          createdAt: new Date('2026-03-06T17:44:00').toISOString(),
          user: DEMO_USER,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserPosts();
  }, []);

  const handleDeletePress = post => {
    setSelectedPost(post);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPost) return;
    try {
      setDeleteLoading(true);
      await deletePost(selectedPost._id);
      setPosts(prev => prev.filter(p => p._id !== selectedPost._id));
      setDeleteModal(false);
      setSelectedPost(null);
      Alert.alert('Deleted', 'Post deleted successfully');
    } catch (error) {
      setPosts(prev => prev.filter(p => p._id !== selectedPost._id));
      setDeleteModal(false);
      setSelectedPost(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePostPress = post => {
    navigation.navigate('PostDetail', { post, userId: DEMO_USER._id });
  };

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(DEMO_USER.name)}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {DEMO_USER.streak}</Text>
        </View>
      </View>

      {/* User Info */}
      <Text style={styles.userName}>{DEMO_USER.name}</Text>
      <Text style={styles.userEmail}>{DEMO_USER.email}</Text>
      <Text style={styles.userBio}>{DEMO_USER.bio}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DEMO_USER.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreatePost')}>
        <Text style={styles.createBtnText}>+ Share New Achievement</Text>
      </TouchableOpacity>

      {/* Posts Section Title */}
      <View style={styles.postsSectionHeader}>
        <Text style={styles.postsSectionTitle}>My Achievement Posts</Text>
        <Text style={styles.postsSectionSubtitle}>
          All your shared milestones, streaks and hardware builds.
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
            userId={DEMO_USER._id}
            onPress={handlePostPress}
            onDelete={handleDeletePress}
            showDelete={true}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Share your first achievement!
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.emptyBtnText}>Create Post</Text>
            </TouchableOpacity>
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

      {/* Delete Modal */}
      <DeleteModal
        visible={deleteModal}
        postTitle={selectedPost?.title || ''}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedPost(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
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
  profileHeader: {
    backgroundColor: COLORS.cardBg,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textWhite,
    fontSize: 28,
    fontWeight: '800',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  createBtnText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  postsSectionHeader: {
    width: '100%',
  },
  postsSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  postsSectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
  emptyBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyBtnText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default ProfileScreen;