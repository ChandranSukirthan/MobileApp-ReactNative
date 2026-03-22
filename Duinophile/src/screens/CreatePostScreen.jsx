import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../constants/colors';
import { ACHIEVEMENT_TYPES } from '../constants/types';
import { createPost, updatePost } from '../services/postService';
import { DEMO_USER_ID } from '../constants/demoUser';

const CreatePostScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [achievementType, setAchievementType] = useState('ARDUINO_TASK');
  const [level, setLevel] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState(null);
  const [remoteImageUri, setRemoteImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const editPost = route.params?.post;
  const isEdit = Boolean(editPost?._id);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setAchievementType('ARDUINO_TASK');
    setLevel('');
    setIsPublic(true);
    setImage(null);
    setRemoteImageUri(null);
    setErrors({});
  }, []);

  useFocusEffect(
    useCallback(() => {
      const p = route.params?.post;
      if (p?._id) {
        setTitle(p.title || '');
        setDescription(p.description || '');
        setAchievementType(p.achievementType || 'ARDUINO_TASK');
        setLevel(p.level != null ? String(p.level) : '');
        setIsPublic(p.isPublic !== false);
        setImage(null);
        setRemoteImageUri(p.image || null);
        setErrors({});
      } else {
        resetForm();
      }
    }, [route.params?.post, resetForm]),
  );

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.trim().length > 100)
      newErrors.title = 'Title cannot exceed 100 characters';
    if (description.length > 500)
      newErrors.description = 'Description cannot exceed 500 characters';
    if (level && isNaN(Number(level)))
      newErrors.level = 'Level must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          setImage(response.assets[0]);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        achievementType,
        level: level ? Number(level) : null,
        isPublic,
        image,
      };

      if (isEdit) {
        await updatePost(editPost._id, payload);
        Alert.alert('Updated', 'Your post was saved.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createPost({
          ...payload,
          userId: DEMO_USER_ID,
        });
        Alert.alert('Success! 🎉', 'Your achievement has been published!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        isEdit ? 'Could not save' : 'Could not publish',
        error?.message ||
          'Check that the API is running and MongoDB is connected.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEdit ? (
              <>
                Edit <Text style={styles.headerTitleBlue}>Achievement</Text>
              </>
            ) : (
              <>
                Create <Text style={styles.headerTitleBlue}>New</Text> Achievement
              </>
            )}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEdit
              ? 'Update your post — changes sync to your profile and the feed.'
              : 'Share your Arduino progress with the Duinophile community'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Achievement Details</Text>
          <Text style={styles.formSubtitle}>
            Fields marked with a dot are required.
          </Text>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>•</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g. Completed LED Matrix Project"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={text => {
                setTitle(text);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              maxLength={100}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Achievement Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Achievement Type <Text style={styles.required}>•</Text>
            </Text>
            <View style={styles.typeGrid}>
              {ACHIEVEMENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        achievementType === type.value
                          ? type.bgColor
                          : COLORS.inputBg,
                      borderColor:
                        achievementType === type.value
                          ? type.color
                          : COLORS.border,
                    },
                  ]}
                  onPress={() => setAchievementType(type.value)}>
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color:
                          achievementType === type.value
                            ? type.color
                            : COLORS.textSecondary,
                      },
                    ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="Describe your achievement..."
              placeholderTextColor={COLORS.textLight}
              value={description}
              onChangeText={text => {
                setDescription(text);
                if (errors.description)
                  setErrors({ ...errors, description: null });
              }}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Image Upload */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Upload Image / Screenshot</Text>
            <TouchableOpacity
              style={styles.imageUpload}
              onPress={handleImagePick}>
              {image || remoteImageUri ? (
                <Image
                  source={{ uri: image?.uri || remoteImageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imageIcon}>🖼️</Text>
                  <Text style={styles.imageUploadText}>
                    Click to upload image
                  </Text>
                  <Text style={styles.imageUploadSubtext}>
                    PNG, JPG, GIF — optional
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {image ? (
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImage(null)}>
                <Text style={styles.removeImageText}>✕ Remove new image</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Level */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Level / Value</Text>
            <TextInput
              style={[styles.input, errors.level && styles.inputError]}
              placeholder="e.g. 20"
              placeholderTextColor={COLORS.textLight}
              value={level}
              onChangeText={text => {
                setLevel(text);
                if (errors.level) setErrors({ ...errors, level: null });
              }}
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.fieldHint}>
              ℹ️ Optional — enter the streak length, module number, or level
              reached.
            </Text>
            {errors.level && (
              <Text style={styles.errorText}>{errors.level}</Text>
            )}
          </View>

          {/* Make Public Toggle */}
          <View style={styles.toggleCard}>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: COLORS.border, true: COLORS.blue }}
              thumbColor={COLORS.textWhite}
            />
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Make this post public</Text>
              <Text style={styles.toggleSubtitle}>
                Visible on the community home page for others to see and react
                to.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEdit ? '💾  Save changes' : '✏️  Publish Achievement'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerTitleBlue: {
    color: COLORS.blue,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: COLORS.blue,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.blue,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  imageUpload: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 120,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 6,
  },
  imageIcon: {
    fontSize: 32,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeImageBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  removeImageText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default CreatePostScreen;