import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSettings, useColorScheme } from '@/contexts/settings-context';
import { ThemePreference } from '@/types/settings';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings } = useSettings();

  const isAutoSync = settings.syncMode === 'automatic';

  const themeOptions: { value: ThemePreference; label: string; description: string }[] = [
    { value: 'system', label: 'System', description: 'Follow system appearance' },
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
          Settings
        </Text>
      </View>

      <View style={styles.content}>
        {/* Theme Selection */}
        <View style={[styles.settingSection, isDark ? styles.sectionDark : styles.sectionLight]}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Appearance
          </Text>

          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionRow,
                isDark ? styles.optionRowDark : styles.optionRowLight,
                index === 0 && styles.optionRowFirst,
                settings.theme === option.value && styles.optionSelected,
              ]}
              onPress={() => updateSettings({ theme: option.value })}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.theme === option.value }}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, isDark ? styles.textDark : styles.textLight]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, isDark ? styles.descDark : styles.descLight]}>
                  {option.description}
                </Text>
              </View>
              <View style={[styles.radio, settings.theme === option.value && styles.radioSelected]}>
                {settings.theme === option.value && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Server Polling Toggle */}
        <View style={[styles.settingRow, isDark ? styles.settingRowDark : styles.settingRowLight]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
              Server Status Polling
            </Text>
            <Text style={[styles.settingDescription, isDark ? styles.descDark : styles.descLight]}>
              Periodically check if the server is online
            </Text>
          </View>
          <Switch
            value={settings.enableServerPolling}
            onValueChange={(value) => updateSettings({ enableServerPolling: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.enableServerPolling ? '#007aff' : '#f4f3f4'}
          />
        </View>

        {/* Sync Mode */}
        <View style={[styles.settingSection, isDark ? styles.sectionDark : styles.sectionLight]}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Sync Mode
          </Text>

          <TouchableOpacity
            style={[
              styles.optionRow,
              isDark ? styles.optionRowDark : styles.optionRowLight,
              !isAutoSync && styles.optionSelected,
            ]}
            onPress={() => updateSettings({ syncMode: 'manual' })}
            accessibilityRole="radio"
            accessibilityState={{ checked: !isAutoSync }}
          >
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, isDark ? styles.textDark : styles.textLight]}>
                Manual Sync
              </Text>
              <Text style={[styles.optionDescription, isDark ? styles.descDark : styles.descLight]}>
                Sync only when you tap the &quot;Sync Now&quot; button
              </Text>
            </View>
            <View style={[styles.radio, !isAutoSync && styles.radioSelected]}>
              {!isAutoSync && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionRow,
              isDark ? styles.optionRowDark : styles.optionRowLight,
              isAutoSync && styles.optionSelected,
            ]}
            onPress={() => updateSettings({ syncMode: 'automatic' })}
            accessibilityRole="radio"
            accessibilityState={{ checked: isAutoSync }}
          >
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, isDark ? styles.textDark : styles.textLight]}>
                Automatic Sync
              </Text>
              <Text style={[styles.optionDescription, isDark ? styles.descDark : styles.descLight]}>
                Automatically sync changes with the server
              </Text>
            </View>
            <View style={[styles.radio, isAutoSync && styles.radioSelected]}>
              {isAutoSync && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Info text */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, isDark ? styles.descDark : styles.descLight]}>
            {isAutoSync
              ? 'Changes will be synced automatically when online. A notification will appear when sync completes.'
              : 'You control when to sync. Pending changes will be shown on the main screen with a "Sync Now" button.'}
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1c1c1c',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingRowLight: {
    backgroundColor: '#f5f5f5',
  },
  settingRowDark: {
    backgroundColor: '#2a2a2a',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  descLight: {
    color: '#666',
  },
  descDark: {
    color: '#999',
  },
  settingSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionLight: {
    backgroundColor: '#f5f5f5',
  },
  sectionDark: {
    backgroundColor: '#2a2a2a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  optionRowFirst: {
    borderTopWidth: 0,
  },
  optionRowLight: {
    borderTopColor: '#e0e0e0',
  },
  optionRowDark: {
    borderTopColor: '#3a3a3a',
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#007aff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007aff',
  },
  infoSection: {
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
