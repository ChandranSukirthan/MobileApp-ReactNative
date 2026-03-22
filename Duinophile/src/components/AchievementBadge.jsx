import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAchievementInfo } from '../utils/helpers';

const AchievementBadge = ({ type, size = 'medium' }) => {
  const info = getAchievementInfo(type);

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: info.bgColor },
        isSmall && styles.badgeSmall,
      ]}>
      <Text
        style={[
          styles.badgeText,
          { color: info.color },
          isSmall && styles.badgeTextSmall,
        ]}>
        {info.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 10,
  },
});

export default AchievementBadge;