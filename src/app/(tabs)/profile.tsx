import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/typography/AppText';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals } from '@/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(() => useAppStore.getState().profile);
  const [readingProgress, setReadingProgress] = useState(() => useAppStore.getState().readingProgress);

  useFocusEffect(
    useCallback(() => {
      const state = useAppStore.getState();
      setProfile(state.profile);
      setReadingProgress(state.readingProgress);
    }, [])
  );

  const totalChaptersRead = readingProgress.filter((p) => p.completed).length;

  const stats = [
    { icon: 'book-outline' as const,          value: toKannadaNumerals(totalChaptersRead),       label: 'ಅಧ್ಯಾಯ',    iconColor: '#8A3324', iconBg: '#FDF0E8' },
    { icon: 'flame-outline' as const,          value: toKannadaNumerals(profile.readingStreak),   label: 'ಸ್ಟ್ರೀಕ್',  iconColor: '#B4832E', iconBg: '#FEF9EC' },
    { icon: 'document-text-outline' as const,  value: toKannadaNumerals(profile.totalVersesRead), label: 'ಶ್ಲೋಕ',    iconColor: '#5E2116', iconBg: '#F5EEE8' },
  ];

  const quickLinks = [
    { icon: 'library-outline' as const,   label: LOCAL_STRINGS.allChapters,     route: '/chapters',  iconBg: '#FDF0E8', iconColor: '#8A3324' },
    { icon: 'settings-outline' as const,  label: LOCAL_STRINGS.settingsTitle,    route: '/settings',  iconBg: '#F0F4FF', iconColor: '#3949AB' },
  ];

  return (
    <View className="flex-1 bg-background-soft" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ───────────────────────────── */}
        <LinearGradient
          colors={['#5E2116', '#8A3324']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 24, paddingBottom: 32, paddingHorizontal: 24, position: 'relative', overflow: 'hidden' }}
        >
          {/* Decorative circle */}
          <View
            style={{
              position: 'absolute', width: 200, height: 200, borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -60,
            }}
          />

          {/* Avatar */}
          <View className="items-center mb-4">
            <View
              style={{
                width: 76, height: 76, borderRadius: 38,
                borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <View className="w-16 h-16 rounded-full bg-background-default items-center justify-center">
                <Ionicons name="person" size={30} color="#8A3324" />
              </View>
            </View>
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            align="center"
            style={{ color: '#FFFFFF', marginBottom: 6 }}
          >
            {profile.name}
          </AppText>
          <AppText
            variant="caption"
            align="center"
            style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 }}
          >
            ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಓದುಗ
          </AppText>
        </LinearGradient>

        {/* ── Stats ─────────────────────────────── */}
        <View className="px-4 mt-5">
          <AppText
            variant="caption"
            weight="semibold"
            className="text-text-muted uppercase tracking-widest mb-3 ml-1"
          >
            ನಿಮ್ಮ ಅಂಕಿಅಂಶಗಳು
          </AppText>
          <View className="flex-row">
            {stats.map((s, i) => (
              <View
                key={i}
                className="flex-1 bg-white rounded-2xl border border-border-light items-center py-4"
                style={{
                  marginRight: i < stats.length - 1 ? 8 : 0,
                  shadowColor: '#3D2314',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: s.iconBg }}
                >
                  <Ionicons name={s.icon} size={19} color={s.iconColor} />
                </View>
                <AppText variant="title" weight="bold" style={{ color: '#3D2314' }}>
                  {s.value}
                </AppText>
                <AppText variant="caption" color="muted" align="center" style={{ fontSize: 10, marginTop: 2 }}>
                  {s.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Links ───────────────────────── */}
        <View className="px-4 mt-6">
          <AppText
            variant="caption"
            weight="semibold"
            className="text-text-muted uppercase tracking-widest mb-3 ml-1"
          >
            ತ್ವರಿತ ಮಾರ್ಗಗಳು
          </AppText>
          <View
            className="bg-white rounded-3xl overflow-hidden border border-border-light"
            style={{
              shadowColor: '#3D2314',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {quickLinks.map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={() => { haptics.light(); router.push(item.route as any); }}
                style={({ pressed }) => ({ backgroundColor: pressed ? '#FBF5EE' : '#FFFFFF' })}
                className={idx < quickLinks.length - 1 ? 'border-b border-border-light' : ''}
              >
                <View className="flex-row items-center px-4 py-3.5">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <AppText variant="body" weight="medium" className="flex-1 text-primary-dark">
                    {item.label}
                  </AppText>
                  <Ionicons name="chevron-forward" size={16} color="#C4B5A9" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Contact ───────────────────────────── */}
        <View className="px-4 mt-6">
          <AppText
            variant="caption"
            weight="semibold"
            className="text-text-muted uppercase tracking-widest mb-3 ml-1"
          >
            ಸಂಪರ್ಕಿಸಿ (Contact Us)
          </AppText>
          <View
            className="bg-white rounded-3xl overflow-hidden border border-border-light"
            style={{
              shadowColor: '#3D2314',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Brand */}
            <LinearGradient
              colors={['#5E2116', '#8A3324']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="code-slash" size={18} color="#FFFFFF" />
              </View>
              <View>
                <AppText variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
                  MSV Global Tech
                </AppText>
                <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 }}>
                  Developed & Maintained by
                </AppText>
              </View>
            </LinearGradient>

            {/* Message */}
            <View className="px-4 py-3.5 bg-[#FFFDF9] border-b border-border-light">
              <AppText variant="caption" className="text-text-muted mb-2" style={{ lineHeight: 18 }}>
                If you find any mistakes or have feedback, please contact us. We will try to resolve it.
              </AppText>
              <AppText variant="caption" className="text-text-muted" style={{ lineHeight: 18 }}>
                ತಪ್ಪುಗಳು ಕಂಡರೆ ಅಥವಾ ಸಲಹೆಗಳಿದ್ದರೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಾವು ಅದನ್ನು ಸರಿಪಡಿಸಲು ಪ್ರಯತ್ನಿಸುತ್ತೇವೆ.
              </AppText>
            </View>

            {/* Website */}
            <Pressable
              onPress={() => Linking.openURL('https://msvglobaltech.com')}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="flex-row items-center px-4 py-3.5 border-b border-border-light"
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center mr-3 bg-secondary-subtle">
                <Ionicons name="globe-outline" size={18} color="#8C6220" />
              </View>
              <AppText variant="bodySmall" weight="semibold" className="flex-1 text-primary-dark">
                msvglobaltech.com
              </AppText>
              <Ionicons name="open-outline" size={14} color="#A88C74" />
            </Pressable>

            {/* Email */}
            <Pressable
              onPress={() => Linking.openURL('mailto:msvglobaltech@gmail.com')}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="flex-row items-center px-4 py-3.5 border-b border-border-light"
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center mr-3 bg-primary-subtle">
                <Ionicons name="mail-outline" size={18} color="#8A3324" />
              </View>
              <AppText variant="bodySmall" weight="semibold" className="flex-1 text-primary-dark">
                msvglobaltech@gmail.com
              </AppText>
              <Ionicons name="open-outline" size={14} color="#A88C74" />
            </Pressable>

            {/* WhatsApp */}
            <Pressable
              onPress={() => Linking.openURL('https://wa.me/918123363394')}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="flex-row items-center px-4 py-3.5 bg-[#F0FDF4]"
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center mr-3 bg-[#DCFCE7]">
                <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
              </View>
              <AppText variant="bodySmall" weight="semibold" className="flex-1" style={{ color: '#16A34A' }}>
                +91 8123363394
              </AppText>
              <Ionicons name="open-outline" size={14} color="#86EFAC" />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-6 mb-2 items-center">
          <View className="flex-row items-center justify-center mb-1">
            <Ionicons name="heart" size={11} color="#B4832E" />
            <AppText variant="caption" className="text-text-subtle ml-1">
              Made with love in India
            </AppText>
          </View>
          <AppText variant="caption" className="text-text-subtle opacity-70">
            Siddhanta Shikamani App • Version 1.0.0
          </AppText>
        </View>

      </ScrollView>
    </View>
  );
}
