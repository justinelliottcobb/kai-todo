import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/contexts/settings-context';
import { SyncStatus as SyncStatusType } from '@/services/sync';

interface SyncStatusProps {
  syncStatus: SyncStatusType;
  lastSyncTime: number | null;
  pendingChanges: number;
  syncError: string | null;
  isOnline: boolean;
  isServerOnline: boolean;
  syncMode: 'manual' | 'automatic';
  onSync: () => void;
}

export function SyncStatus({
  syncStatus,
  lastSyncTime,
  pendingChanges,
  syncError,
  isOnline,
  isServerOnline,
  syncMode,
  onSync,
}: SyncStatusProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const canConnect = isOnline && isServerOnline;
  const isAutoSync = syncMode === 'automatic';

  const getStatusColor = () => {
    if (!isOnline) return '#ff9500'; // Orange for network offline
    if (!isServerOnline) return '#ff3b30'; // Red for server unreachable
    if (syncStatus === 'error') return '#ff3b30'; // Red for error
    if (syncStatus === 'syncing') return '#007aff'; // Blue for syncing
    // In auto mode, don't show pending as orange
    if (!isAutoSync && pendingChanges > 0) return '#ff9500'; // Orange for pending (manual mode only)
    return '#34c759'; // Green for synced
  };

  const getStatusText = () => {
    if (!isOnline) return 'Network Offline';
    if (!isServerOnline) return 'Server Unreachable';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync failed';
    // In auto mode, don't show pending count
    if (!isAutoSync && pendingChanges > 0) return `${pendingChanges} pending`;
    return isAutoSync ? 'Auto-sync enabled' : 'Synced';
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Only show sync button in manual mode
  const showSyncButton = !isAutoSync && canConnect && syncStatus !== 'syncing';

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, isDark ? styles.textDark : styles.textLight]}>
          {getStatusText()}
        </Text>
        {syncStatus === 'syncing' && (
          <ActivityIndicator size="small" color={getStatusColor()} style={styles.spinner} />
        )}
      </View>

      <View style={styles.actionsRow}>
        <Text style={[styles.lastSync, isDark ? styles.lastSyncDark : styles.lastSyncLight]}>
          {getLastSyncText()}
        </Text>
        {showSyncButton && (
          <TouchableOpacity
            onPress={onSync}
            style={[styles.syncButton, isDark ? styles.syncButtonDark : styles.syncButtonLight]}
            accessibilityLabel="Sync now"
            accessibilityRole="button"
          >
            <Text style={[styles.syncButtonText, isDark ? styles.textDark : styles.textLight]}>
              Sync Now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {syncError && (
        <Text style={styles.errorText}>{syncError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#2a2a2a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  spinner: {
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lastSync: {
    fontSize: 12,
  },
  lastSyncLight: {
    color: '#666',
  },
  lastSyncDark: {
    color: '#999',
  },
  syncButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    color: '#fff',
  },
  syncButtonLight: {
    backgroundColor: '#007aff',
  },
  syncButtonDark: {
    backgroundColor: '#0a84ff',
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 6,
  },
});
