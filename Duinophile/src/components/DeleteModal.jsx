import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';

const DeleteModal = ({ visible, postTitle, onCancel, onConfirm, loading }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Delete Post?</Text>
          <Text style={styles.message}>
            Are you sure you want to delete this post?
          </Text>
          <Text style={styles.postTitle}>"{postTitle}"</Text>
          <Text style={styles.warning}>This action cannot be undone.</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} size="small" />
              ) : (
                <Text style={styles.deleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 15,
    color: COLORS.textWhite,
    fontWeight: '600',
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textWhite,
    fontWeight: '600',
    fontSize: 15,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default DeleteModal;