import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { COLORS } from '../constants/colors';
import AchievementBadge from './AchievementBadge';
import { formatDate, getInitials, userHasLiked } from '../utils/helpers';
import { likePost } from '../services/postService';

const PostCard = ({
  post,
  userId,
  onDelete,
  onEdit,
  onPress,
  showDelete = false,
}) => {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(userHasLiked(post.likes, userId));
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    setLikes(post.likes?.length || 0);
    setIsLiked(userHasLiked(post.likes, userId));
  }, [post._id, post.likes, userId]);

  const handleLike = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please login to like posts');
      return;
    }
    try {
      setLikeLoading(true);
      const response = await likePost(post._id, userId);
      setLikes(response.likes);
      setIsLiked(response.isLiked);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const parts = [post.title || 'Duinophile post'];
      if (post.description) parts.push(post.description);
      await Share.share({ message: parts.join('\n\n') });
    } catch (e) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Share', 'Could not open share sheet.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(post)}
      activeOpacity={0.95}>

      {/* Top color bar based on achievement type */}
      <View style={styles.colorBar} />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(post.user?.name || 'U')}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {post.user?.name || 'Unknown'}
              </Text>
              <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          {showDelete && (
            <View style={styles.headerActions}>
              {onEdit ? (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => onEdit(post)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => onDelete && onDelete(post)}>
                <Text style={styles.menuIcon}>⋯</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Description */}
        {post.description ? (
          <Text style={styles.description}>{post.description}</Text>
        ) : null}

        {/* Image */}
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        {/* Badge + Level */}
        <View style={styles.badgeRow}>
          <AchievementBadge type={post.achievementType} size="small" />
          {post.level ? (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {post.level}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleLike}
            disabled={likeLoading}>
            <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>Like {likes > 0 ? likes : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onPress && onPress(post)}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>
              Comment {post.comments?.length > 0 ? post.comments.length : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorBar: {
    height: 4,
    backgroundColor: COLORS.blue,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textWhite,
    fontWeight: '800',
    fontSize: 14,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
  },
  menuIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.inputBg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default PostCard;