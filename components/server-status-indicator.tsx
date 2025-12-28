import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from '@/contexts/settings-context';

interface ServerStatusIndicatorProps {
  isServerOnline: boolean;
  onPress?: () => void;
}

export function ServerStatusIndicator({
  isServerOnline,
  onPress,
}: ServerStatusIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const statusColor = isServerOnline ? '#34c759' : '#ff3b30';
  const statusText = isServerOnline ? 'Online' : 'Offline';

  return (
    <TouchableOpacity
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      onPress={onPress}
      accessibilityLabel={`Server status: ${statusText}. Tap to refresh.`}
      accessibilityRole="button"
    >
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.statusText, isDark ? styles.textDark : styles.textLight]}>
        {statusText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  containerLight: {
    backgroundColor: '#f0f0f0',
  },
  containerDark: {
    backgroundColor: '#333',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
});
