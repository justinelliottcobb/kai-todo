import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native';

interface SyncNotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onHide?: () => void;
}

export function SyncNotification({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}: SyncNotificationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, duration, fadeAnim, onHide]);

  if (!visible) return null;

  const backgroundColor = type === 'success'
    ? (isDark ? '#1a472a' : '#d4edda')
    : (isDark ? '#4a1a1a' : '#f8d7da');

  const textColor = type === 'success'
    ? (isDark ? '#98d4aa' : '#155724')
    : (isDark ? '#f5a5a5' : '#721c24');

  const icon = type === 'success' ? '✓' : '✕';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, opacity: fadeAnim },
      ]}
    >
      <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
