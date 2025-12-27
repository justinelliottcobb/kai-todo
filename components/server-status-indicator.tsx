import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';

interface ServerStatusIndicatorProps {
  isServerOnline: boolean;
  isChecking: boolean;
  onPress?: () => void;
}

export function ServerStatusIndicator({
  isServerOnline,
  isChecking,
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
      {isChecking ? (
        <ActivityIndicator size="small" color={isDark ? '#fff' : '#666'} />
      ) : (
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      )}
      <Text style={[styles.statusText, isDark ? styles.textDark : styles.textLight]}>
        {isChecking ? 'Checking...' : statusText}
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
