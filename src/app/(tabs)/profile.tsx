import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Linking, Modal, Share, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/typography/AppText';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals } from '@/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { HStack, VStack } from '@/components/layouts/Containers';
import { Button } from '@/components/buttons/Button';

const ADMIN_PASSCODE = 'Shivu@2208';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.msvglobaltech.siddhantashikamani';

const WHATS_NEW = [
  {
    version: '1.0.1',
    date: 'ಆಗಸ್ಟ್ ೨೦೨೬',
    changes: [
      '✨ ಹೊಸ ವಿನ್ಯಾಸದ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಪ್ರೊಫೈಲ್ ಇಂಟರ್‌ಫೇಸ್',
      '🌐 ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ದ್ವಿಭಾಷಾ ಲೇಬಲ್‌ಗಳು',
      '⚡ ಆಡಳಿತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು ಕ್ಲೌಡ್ ಸಿಂಕ್ ಸುಧಾರಣೆಗಳು',
      '📖 ಶ್ಲೋಕ ಓದುವ ಅನುಭವದ ಸರಳೀಕರಣ',
    ],
  },
  {
    version: '1.0.0',
    date: 'ಆಗಸ್ಟ್ ೨೦೨೬',
    changes: [
      '🎉 ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಅಪ್ಲಿಕೇಶನ್‌ನ ಮೊದಲ ಆವೃತ್ತಿ ಬಿಡುಗಡೆ',
      '📖 ೨೧ ಪರಿಚ್ಛೇದಗಳು ಮತ್ತು ಶ್ಲೋಕಗಳು',
      '🔖 ಬುಕ್ಮಾರ್ಕ್ ಮತ್ತು ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್',
      '📴 ಆಫ್ಲೈನ್ ಓದುವಿಕೆ ಬೆಂಬಲ',
    ],
  },
];

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

  const [showAbout, setShowAbout] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminError, setAdminError] = useState('');
  const bottomInset = Math.max(insets.bottom, 8);

  const handleAdminVerify = () => {
    if (adminPasscode === ADMIN_PASSCODE) {
      haptics.success();
      setShowAdminModal(false);
      setAdminPasscode('');
      setAdminError('');
      router.push('/admin');
    } else {
      haptics.error();
      setAdminError('ಅಮಾನ್ಯ ಆಡಳಿತ ಕೋಡ್ (Invalid Admin Code)');
    }
  };

  const handleInviteFriends = async () => {
    haptics.light();
    try {
      await Share.share({
        title: 'ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ',
        message:
          'ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನದ ಮಾರ್ಗ ಕಂಡುಕೊಳ್ಳಿ!\n\n' +
          PLAY_STORE_URL,
        url: PLAY_STORE_URL,
      });
    } catch (_) {
      // User dismissed share sheet — no action needed
    }
  };

  const handleRateApp = async () => {
    haptics.light();
    const supported = await Linking.canOpenURL(PLAY_STORE_URL);
    if (supported) {
      await Linking.openURL(
        `market://details?id=com.msvglobaltech.siddhantashikamani`,
      );
    } else {
      await Linking.openURL(PLAY_STORE_URL);
    }
  };

  const totalChaptersRead = (readingProgress ?? []).filter((p) => p.completed).length;

  const stats = [
    { icon: 'book-outline' as const, value: toKannadaNumerals(totalChaptersRead), label: 'ಅಧ್ಯಾಯ', iconColor: '#8A3324', iconBg: '#FDF0E8' },
    { icon: 'flame-outline' as const, value: toKannadaNumerals(profile.readingStreak), label: 'ಸ್ಟ್ರೀಕ್', iconColor: '#B4832E', iconBg: '#FEF9EC' },
    { icon: 'document-text-outline' as const, value: toKannadaNumerals(profile.totalVersesRead), label: 'ಶ್ಲೋಕ', iconColor: '#5E2116', iconBg: '#F5EEE8' },
  ];

  const quickLinks = [
    { icon: 'library-outline' as const, label: LOCAL_STRINGS.allChapters, sublabel: 'All Chapters', route: '/chapters', iconBg: '#FDF0E8', iconColor: '#8A3324' },
    { icon: 'settings-outline' as const, label: LOCAL_STRINGS.settingsTitle, sublabel: 'Settings', route: '/settings', iconBg: '#F0F4FF', iconColor: '#3949AB' },
  ];

  return (
    <View className="flex-1 bg-[#F9F6F0]" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Modern Header with Material Design ───────────────────────────── */}
        <LinearGradient
          colors={['#8A3324', '#B5654A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 32, paddingBottom: 40, paddingHorizontal: 20, position: 'relative', overflow: 'hidden' }}
        >
          {/* Modern decorative elements */}
          <View
            style={{
              position: 'absolute', width: 150, height: 150, borderRadius: 75,
              backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30,
            }}
          />
          <View
            style={{
              position: 'absolute', width: 100, height: 100, borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -20,
            }}
          />

          {/* Modern Avatar with elevation */}
          <View className="items-center mb-5">
            <View
              style={{
                width: 90, height: 90, borderRadius: 45,
                borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <Ionicons name="person" size={36} color="#8A3324" />
              </View>
            </View>
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            align="center"
            style={{ color: '#FFFFFF', marginBottom: 8, fontSize: 24 }}
          >
            {profile.name}
          </AppText>
          <View className="bg-white/20 px-4 py-1.5 rounded-full">
            <AppText
              variant="caption"
              align="center"
              style={{ color: '#FFFFFF', letterSpacing: 0.8, fontSize: 12 }}
            >
              📖 ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಓದುಗ
            </AppText>
          </View>
        </LinearGradient>



        {/* ── Modern Quick Links with Material Design ───────────────────────── */}
        <View className="px-4 mt-6">
          <AppText
            variant="heading3"
            weight="bold"
            className="text-[#3D2314] mb-4"
          >
            Quick Access
          </AppText>

          <View
            className="bg-[#FFFBF5] rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {quickLinks.map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  haptics.light();
                  if (item.route) {
                    router.push(item.route as any);
                  }
                }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#FFF5F0' : '#FFFBF5',
                  opacity: pressed ? 0.9 : 1
                })}
                className={idx < quickLinks.length - 1 ? 'border-b border-amber-100' : ''}
              >
                <View className="flex-row items-center px-5 py-3">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View className="flex-1">
                    <AppText weight="semibold" style={{ color: '#3D2314', fontSize: 15 }}>
                      {item.label}
                    </AppText>
                    <AppText style={{ color: '#6B5040', fontSize: 12 }}>{item.sublabel}</AppText>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── App Info Section ───────────────────────────── */}
        <View className="px-4 mt-6">
          <AppText
            variant="heading3"
            weight="bold"
            className="text-[#3D2314] mb-4"
          >
            App Info
          </AppText>

          <View
            className="bg-[#FFFBF5] rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {[
              { label: 'ಬಗ್ಗೆ', sublabel: 'About', icon: 'help-circle-outline' as const, iconColor: '#8A3324', iconBg: '#FDF0E8', action: () => { haptics.light(); setShowAbout(true); } },
              { label: 'ಸ್ನೇಹಿತರನ್ನು ಆಹ್ವಾನಿಸಿ', sublabel: 'Invite Friends', icon: 'people-outline' as const, iconColor: '#10B981', iconBg: '#ECFDF5', action: handleInviteFriends },
              { label: 'ಅಪ್ಲಿಕೇಶನ್ ರೇಟ್ ಮಾಡಿ', sublabel: 'Rate App', icon: 'star-outline' as const, iconColor: '#F59E0B', iconBg: '#FFFBEB', action: handleRateApp },
              { label: 'ಹೊಸದೇನಿದೆ?', sublabel: "What's New", icon: 'sparkles-outline' as const, iconColor: '#8B5CF6', iconBg: '#F5F3FF', action: () => { haptics.light(); setShowWhatsNew(true); } },
            ].map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={item.action}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#FFF5F0' : '#FFFBF5',
                  opacity: pressed ? 0.9 : 1
                })}
                className={idx < 3 ? 'border-b border-amber-100' : ''}
              >
                <View className="flex-row items-center px-5 py-3">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View className="flex-1">
                    <AppText weight="semibold" style={{ color: '#3D2314', fontSize: 15 }}>
                      {item.label}
                    </AppText>
                    <AppText style={{ color: '#6B5040', fontSize: 12 }}>{item.sublabel}</AppText>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Contact Section ───────────────────────────── */}
        <View className="px-4 mt-6">
          <AppText
            variant="heading3"
            weight="bold"
            className="text-[#3D2314] mb-4"
          >
            Contact Us
          </AppText>

          <View
            className="bg-[#FFFBF5] rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Clean Brand Header */}
            <View className="px-5 py-4 border-b border-amber-100 bg-[#FFF8ED]">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-[#8A3324]">
                  <Ionicons name="code-slash" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <AppText variant="body" weight="bold" className="text-[#3D2314]" style={{ fontSize: 16 }}>
                    MSV Global Tech
                  </AppText>
                  <AppText variant="caption" className="text-gray-600" style={{ fontSize: 12 }}>
                    Developed by MSV Global Tech
                  </AppText>
                </View>
              </View>
            </View>

            {/* Message Section */}
            <View className="px-5 py-4 border-b border-amber-100">
              <AppText variant="body" className="text-gray-600" style={{ lineHeight: 22, fontSize: 14 }}>
                If you find any mistakes or have feedback, please contact us. We will try to resolve it.
              </AppText>
              <AppText variant="body" className="text-gray-600 mt-2" style={{ lineHeight: 22, fontSize: 14 }}>
                ತಪ್ಪುಗಳು ಕಂಡರೆ ಅಥವಾ ಸಲಹೆಗಳಿದ್ದರೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಾವು ಅದನ್ನು ಸರಿಪಡಿಸಲು ಪ್ರಯತ್ನಿಸುತ್ತೇವೆ.
              </AppText>
            </View>

            {/* Clean Contact Items */}
            <Pressable
              onPress={() => Linking.openURL('https://msvglobaltech.com')}
              style={({ pressed }) => ({ backgroundColor: pressed ? '#FFF5F0' : '#FFFBF5' })}
              className="flex-row items-center px-5 py-3.5 border-b border-amber-100"
            >
              <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-blue-100">
                <Ionicons name="globe-outline" size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <AppText variant="body" weight="medium" className="text-[#3D2314]" style={{ fontSize: 15 }}>
                  Website
                </AppText>
              </View>
              <AppText variant="caption" className="text-gray-700 mr-2" style={{ fontSize: 13 }}>
                msvglobaltech.com
              </AppText>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL('mailto:msvglobaltech@gmail.com')}
              style={({ pressed }) => ({ backgroundColor: pressed ? '#FFF5F0' : '#FFFBF5' })}
              className="flex-row items-center px-5 py-3.5"
            >
              <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-red-100">
                <Ionicons name="mail-outline" size={20} color="#DC2626" />
              </View>
              <View className="flex-1">
                <AppText variant="body" weight="medium" className="text-[#3D2314]" style={{ fontSize: 15 }}>
                  Email
                </AppText>
              </View>
              <AppText variant="caption" className="text-gray-700 mr-2" style={{ fontSize: 13 }}>
                msvglobaltech@gmail.com
              </AppText>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 32, marginBottom: 16, marginHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: '#FFFBF5',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#EDD9A3',
              paddingVertical: 20,
              paddingHorizontal: 24,
              alignItems: 'center',
            }}
          >
            {/* Hidden admin entry — book icon */}
            <Pressable
              onPress={() => { haptics.light(); setShowAdminModal(true); }}
              hitSlop={8}
              style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: '#8A3324',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="book" size={24} color="#FFFFFF" />
            </Pressable>

            <AppText weight="bold" style={{ color: '#3D2314', fontSize: 15, marginBottom: 2 }}>
              ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ
            </AppText>
            <AppText style={{ color: '#9B7B6B', fontSize: 11, marginBottom: 14 }}>
              Siddhanta Shikamani App
            </AppText>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#EDD9A3', width: '100%', marginBottom: 14 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                backgroundColor: '#FDF0E8',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 5,
              }}>
                <AppText weight="bold" style={{ color: '#8A3324', fontSize: 12 }}>v1.0.1</AppText>
              </View>
              <AppText style={{ color: '#B0967A', fontSize: 11 }}>• MSV Global Tech</AppText>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ══════════════════ About Modal ══════════════════ */}
      <Modal
        visible={showAbout}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAbout(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={() => setShowAbout(false)}
          />
          <View
            className="bg-white rounded-t-[32px] p-6 relative z-10 max-h-[85%]"
            style={{ paddingBottom: bottomInset + 24 }}
          >
            <View className="w-12 h-1.5 rounded-full bg-border-strong self-center mb-6" />

            <View className="items-center mb-6">
              <LinearGradient
                colors={['#A0522D', '#7A2E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-20 h-20 rounded-[28px] items-center justify-center mb-4"
                style={{
                  shadowColor: '#8A3324',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 14,
                }}
              >
                <Ionicons name="book" size={36} color="#FFFFFF" />
              </LinearGradient>
              <AppText variant="heading2" weight="bold" className="mb-1">
                {LOCAL_STRINGS.appName}
              </AppText>
              <AppText variant="body" color="muted" align="center" className="mb-1">
                {LOCAL_STRINGS.appDescription}
              </AppText>
              <AppText variant="caption" color="subtle">
                {LOCAL_STRINGS.version} 1.0.1
              </AppText>
            </View>

            <View className="h-px bg-border-light mb-6" />

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[40vh] mb-6">
              <VStack spacing="md">
                <VStack spacing="xs">
                  <AppText variant="title" weight="semibold">
                    ನಮ್ಮ ಬಗ್ಗೆ
                  </AppText>
                  <AppText variant="body" color="muted" align="justify">
                    ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಒಂದು ಪ್ರಮುಖ ಆಧ್ಯಾತ್ಮಿಕ ಮತ್ತು ದಾರ್ಶನಿಕ ಗ್ರಂಥವಾಗಿದ್ದು, ಮಾನವನಿಗೆ ಜ್ಞಾನ, ಕರ್ಮ ಮತ್ತು ಭಕ್ತಿಯ ಮಾರ್ಗಗಳನ್ನು ಬೋಧಿಸುತ್ತದೆ. ಈ ಅಪ್ಲಿಕೇಶನ್ ನಿಮಗೆ ಸೌಕರ್ಯಪೂರ್ವಕವಾಗಿ ಈ ಮಹತ್ವವಾದ ಬೋಧನೆಗಳನ್ನು ಓದಲು ಅನುಮತಿಸುತ್ತದೆ.
                  </AppText>
                </VStack>

                <VStack spacing="xs">
                  <AppText variant="title" weight="semibold">
                    ವೈಶಿಷ್ಟ್ಯಗಳು
                  </AppText>
                  <View className="flex-row flex-wrap">
                    {[
                      'ಕನ್ನಡ ಭಾಷಾಂತರ',
                      'ಬುಕ್ಮಾರ್ಕ್ ಸ್ಥಳಗಳು',
                      'ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್',
                      'ಸಾಧನೆಗಳು',
                      'ಕಸ್ಟಮ್ ಫಾಂಟ್',
                      'ಆಫ್ಲೈನ್ ಓದುವಿಕೆ',
                    ].map((feature) => (
                      <View key={feature} className="flex-row items-center mr-4 mb-2 w-[45%]">
                        <Ionicons name="checkmark-circle" size={14} color="#4B8B3B" />
                        <AppText variant="caption" color="muted" className="ml-1.5 flex-1">
                          {feature}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </VStack>

                <VStack spacing="xs">
                  <AppText variant="title" weight="semibold">
                    {LOCAL_STRINGS.developerInfo}
                  </AppText>
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-primary-subtle items-center justify-center">
                      <Ionicons name="business-outline" size={18} color="#8A3324" />
                    </View>
                    <VStack spacing="xs">
                      <AppText variant="body" weight="semibold">
                        ಎಂ.ಎಸ್.ವಿ ಗ್ಲೋಬಲ್ ಟೆಕ್
                      </AppText>
                      <AppText variant="bodySmall" color="muted">
                        MSV Global Tech Apps
                      </AppText>
                    </VStack>
                  </View>
                </VStack>
              </VStack>
            </ScrollView>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                icon="people-outline"
                onPress={() => { setShowAbout(false); handleInviteFriends(); }}
              >
                ಆಹ್ವಾನಿಸಿ
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                icon="close"
                onPress={() => setShowAbout(false)}
              >
                ಮುಚ್ಚಿ
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════ ಹೊಸದೇನಿದೆ? Modal ══════════════════ */}
      <Modal
        visible={showWhatsNew}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWhatsNew(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={() => setShowWhatsNew(false)}
          />
          <View
            className="bg-white rounded-t-[32px] p-6 relative z-10"
            style={{ paddingBottom: bottomInset + 24 }}
          >
            <View className="w-12 h-1.5 rounded-full bg-border-strong self-center mb-6" />

            <View className="flex-row items-center mb-6 gap-3">
              <View className="w-12 h-12 rounded-2xl bg-primary-subtle items-center justify-center">
                <Ionicons name="sparkles" size={22} color="#8A3324" />
              </View>
              <View>
                <AppText variant="heading2" weight="bold">ಹೊಸದೇನಿದೆ?</AppText>
                <AppText variant="caption" color="muted">What's New</AppText>
              </View>
            </View>

            <View className="h-px bg-border-light mb-5" />

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[50vh] mb-6">
              {WHATS_NEW.map((release) => (
                <View key={release.version} className="mb-5">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="bg-primary-subtle px-3 py-1 rounded-full">
                      <AppText variant="caption" weight="bold" color="primary">
                        v{release.version}
                      </AppText>
                    </View>
                    <AppText variant="caption" color="muted">{release.date}</AppText>
                  </View>
                  {release.changes.map((change, idx) => (
                    <View key={idx} className="flex-row mb-2">
                      <AppText variant="body" className="mr-2">•</AppText>
                      <AppText variant="body" color="muted" className="flex-1">
                        {change}
                      </AppText>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            <Button
              variant="gradient"
              fullWidth
              icon="checkmark"
              onPress={() => setShowWhatsNew(false)}
            >
              ಅರ್ಥವಾಯಿತು
            </Button>
          </View>
        </View>
      </Modal>

      {/* ══════════════════ ಆಡಳಿತ (Admin) Modal ══════════════════ */}
      <Modal
        visible={showAdminModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6 bg-black/60">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0"
            onPress={() => setShowAdminModal(false)}
          />
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-amber-100">
            <View className="w-16 h-16 rounded-2xl bg-amber-100 items-center justify-center mb-4 self-center">
              <Ionicons name="shield-checkmark" size={32} color="#8A3324" />
            </View>

            <AppText variant="heading3" weight="bold" align="center" className="text-[#3D2314] mb-1">
              ಆಡಳಿತ ಪ್ರವೇಶ (Admin Portal)
            </AppText>
            <AppText variant="caption" color="muted" align="center" className="mb-5">
              ವಿಷಯ ಸಂಪಾದಿಸಲು ಭದ್ರತಾ ಕೋಡ್ ನಮೂದಿಸಿ
            </AppText>

            <View className="flex-row items-center bg-[#FDFBF7] border border-amber-200 rounded-2xl px-4 py-3 mb-2">
              <Ionicons name="key-outline" size={20} color="#8A3324" />
              <TextInput
                className="flex-1 text-base text-[#3D2314] ml-2"
                placeholder="ಆಡಳಿತ ಕೋಡ್ ನಮೂದಿಸಿ..."
                placeholderTextColor="#A88C74"
                secureTextEntry
                value={adminPasscode}
                onChangeText={(t) => {
                  setAdminPasscode(t);
                  setAdminError('');
                }}
                onSubmitEditing={handleAdminVerify}
                autoFocus
              />
            </View>

            {adminError ? (
              <AppText variant="caption" className="text-red-600 mb-3 px-1">
                {adminError}
              </AppText>
            ) : (
              <View className="h-3" />
            )}

            <View className="flex-row gap-3 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {
                  setShowAdminModal(false);
                  setAdminPasscode('');
                  setAdminError('');
                }}
              >
                ರದ್ದು
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                icon="checkmark"
                onPress={handleAdminVerify}
              >
                ದೃಢೀಕರಿಸಿ
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
