import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors, borderRadius, shadows, typography } from '@/theme';
import { PLAY_STORE_URL, type RemoteVersionInfo } from '@/hooks/useAppUpdate';

interface UpdateModalProps {
  visible: boolean;
  remoteVersionInfo: RemoteVersionInfo | null;
  isApplyingOTA?: boolean;
}

export function UpdateModal({ visible, remoteVersionInfo, isApplyingOTA }: UpdateModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleUpdate = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {
      // Fallback if Play Store can't be opened
      Linking.openURL('market://details?id=com.msvglobaltech.siddhantashikamani');
    });
  };

  // Show OTA applying state
  if (isApplyingOTA) {
    return (
      <Modal visible transparent statusBarTranslucent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔄</Text>
            </View>
            <Text style={styles.title}>Applying Update…</Text>
            <Text style={styles.subtitle}>
              A new version of the app is being installed. The app will restart momentarily.
            </Text>
            <ActivityIndicator
              size="large"
              color={colors.primary.default}
              style={{ marginTop: 16 }}
            />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      // Forced: no way to dismiss via back button
      onRequestClose={() => { }}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📿</Text>
          </View>

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW VERSION</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Update Available</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            A new version of{'\n'}
            <Text style={styles.appName}>Siddhanta Shikamani</Text>
            {'\n'}is available.
          </Text>

          {/* Version row */}
          {remoteVersionInfo?.version && (
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>v{remoteVersionInfo.version}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Release notes */}
          <Text style={styles.description}>
            {remoteVersionInfo?.releaseNotes
              ? remoteVersionInfo.releaseNotes
              : 'Please update the app to continue reading. Updates may include new chapters, bug fixes, and performance improvements.'}
          </Text>

          {/* Update button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            activeOpacity={0.85}
          >
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          {/* Version info */}
          <Text style={styles.footnote}>
            Opens the Play Store to install the latest version
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 10, 6, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius['2xl'],
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.floating,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.primary.soft,
  },
  iconText: {
    fontSize: 36,
  },
  badge: {
    backgroundColor: colors.secondary.subtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary.light,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.secondary.dark,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text.default,
    marginBottom: 8,
    textAlign: 'center',
    ...(Platform.OS !== 'web' ? { fontFamily: 'NotoSansKannada-Bold' } : {}),
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: typography.sizes.base * 1.6,
    marginBottom: 12,
  },
  appName: {
    color: colors.primary.default,
    fontWeight: '700',
  },
  versionRow: {
    backgroundColor: colors.primary.subtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary.soft,
  },
  versionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primary.dark,
    letterSpacing: 0.5,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: 16,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.subtle,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.7,
    marginBottom: 24,
  },
  updateButton: {
    width: '100%',
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.card,
  },
  updateButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.text.inverted,
    letterSpacing: 0.3,
  },
  footnote: {
    fontSize: typography.sizes.xs,
    color: colors.text.subtle,
    textAlign: 'center',
  },
});
