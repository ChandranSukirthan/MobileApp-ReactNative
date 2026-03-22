import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';
import AchievementBadge from '../components/AchievementBadge';
import { formatDate, getInitials } from '../utils/helpers';
import { addComment, likePost } from '../services/postService';

const PostDetailScreen = ({ route, navigation }) => {
  const { post: initialPost, userId } = route.params;
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likes, setLikes] = useState(initialPost.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    initialPost.likes?.includes(userId) || false
  );

  const handleLike = async () => {
    try {
      const response = await likePost(post._id, userId);
      setLikes(response.likes);
      setIsLiked(response.isLiked);
    } catch (error) {
      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    try {
      setCommentLoading(true);
      const comments = await addComment(post._id, userId, comment.trim());
      setPost(prev => ({ ...prev, comments }));
      setComment('');
    } catch (error) {
      const newComment = {
        _id: Date.now().toString(),
        text: comment.trim(),
        user: { name: 'You', avatar: null },
        createdAt: new Date().toISOString(),
      };
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setComment('');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Detail</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Post Content */}
        <View style={styles.postCard}>
          <View style={styles.colorBar} />
          <View style={styles.postContent}>
            {/* User info */}
            <View style={styles.userRow}>
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
              <AchievementBadge type={post.achievementType} />
              {post.level ? (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Level {post.level}</Text>
                </View>
              ) : null}
            </View>

            {/* Like Button */}
            <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
              <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.likeText}>
                {likes} {likes === 1 ? 'Like' : 'Likes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({post.comments?.length || 0})
          </Text>

          {/* Comment Input */}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={COLORS.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[
                styles.commentSubmitBtn,
                commentLoading && styles.commentSubmitDisabled,
              ]}
              onPress={handleAddComment}
              disabled={commentLoading}>
              {commentLoading ? (
                <ActivityIndicator color={COLORS.textWhite} size="small" />
              ) : (
                <Text style={styles.commentSubmitText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, index) => (
              <View key={c._id || index} style={styles.commentCard}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {getInitials(c.user?.name || 'U')}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>
                    {c.user?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <Text style={styles.commentDate}>
                    {formatDate(c.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  backBtnText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: COLORS.cardBg,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  colorBar: {
    height: 4,
    backgroundColor: COLORS.blue,
  },
  postContent: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textWhite,
    fontWeight: '800',
    fontSize: 16,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.inputBg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  likeIcon: {
    fontSize: 22,
  },
  likeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  commentsSection: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    maxHeight: 80,
  },
  commentSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  commentSubmitDisabled: {
    opacity: 0.7,
  },
  commentSubmitText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  commentCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default PostDetailScreen;