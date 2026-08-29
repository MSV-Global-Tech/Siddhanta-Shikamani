import React from 'react';
import { View, ScrollView, Pressable, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, VStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { SettingSwitch } from '@/components/inputs/Inputs';
import { Header } from '@/components/common/Common';
import { useAppStore } from '@/store/useAppStore';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.msvglobaltech.siddhantashikamani';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const haptics = useHapticFeedback();

  const { settings, updateSettings } = useAppStore();

  const handleInviteFriends = async () => {
    haptics.light();
    try {
      await Share.share({
        title: 'ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ',
        message: 'ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನದ ಮಾರ್ಗ ಕಂಡುಕೊಳ್ಳಿ!\n\n' + PLAY_STORE_URL,
        url: PLAY_STORE_URL,
      });
    } catch (_) {}
  };

  const handleRateApp = async () => {
    haptics.light();
    const supported = await Linking.canOpenURL(PLAY_STORE_URL);
    if (supported) {
      await Linking.openURL('market://details?id=com.msvglobaltech.siddhantashikamani');
    } else {
      await Linking.openURL(PLAY_STORE_URL);
    }
  };

  return (
    <ScreenContainer edges={['top']} className="bg-[#F9F6F0]">
      <Header
        title="ಸೆಟ್ಟಿಂಗ್‌ಗಳು"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
      >
        {/* ── 1. ಓದುವಿಕೆ / Reading ──────────────────────── */}
        <View className="px-4 mt-6">
          <VStack spacing="xs" style={{ marginBottom: 16 }}>
            <AppText variant="heading3" weight="bold" className="text-[#3D2314]">
              ಓದುವಿಕೆ
            </AppText>
            <AppText style={{ color: '#9B7B6B', fontSize: 11 }}>Reading Preferences</AppText>
          </VStack>

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
            {/* Sanskrit */}
            <View className="flex-row items-center px-5 py-3.5 border-b border-amber-100">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FDF0E8' }}
              >
                <Ionicons name="language-outline" size={22} color="#8A3324" />
              </View>
              <View className="flex-1 mr-3">
                <AppText weight="semibold" style={{ color: '#3D2314', fontSize: 15 }}>
                  ಸಂಸ್ಕೃತ ಶ್ಲೋಕ
                </AppText>
                <AppText style={{ color: '#6B5040', fontSize: 12 }}>Show Sanskrit Verse</AppText>
              </View>
              <SettingSwitch
                value={settings.showSanskrit}
                onValueChange={(v) => updateSettings({ showSanskrit: v })}
              />
            </View>

            {/* Translation */}
            <View className="flex-row items-center px-5 py-3.5 border-b border-amber-100">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: '#EEF5FF' }}
              >
                <Ionicons name="document-text-outline" size={22} color="#3949AB" />
              </View>
              <View className="flex-1 mr-3">
                <AppText weight="semibold" style={{ color: '#3D2314', fontSize: 15 }}>
                  ಕನ್ನಡ ಭಾವಾರ್ಥ
                </AppText>
                <AppText style={{ color: '#6B5040', fontSize: 12 }}>Show Kannada Translation</AppText>
              </View>
              <SettingSwitch
                value={settings.showTranslation}
                onValueChange={(v) => updateSettings({ showTranslation: v })}
              />
            </View>


            {/* Auto Save */}
            <View className="flex-row items-center px-5 py-3.5">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FEF9EC' }}
              >
                <Ionicons name="save-outline" size={22} color="#B4832E" />
              </View>
              <View className="flex-1 mr-3">
                <AppText weight="semibold" style={{ color: '#3D2314', fontSize: 15 }}>
                  ಸ್ವಯಂ ಪ್ರಗತಿ ಉಳಿಸಿ
                </AppText>
                <AppText style={{ color: '#6B5040', fontSize: 12 }}>Auto-save Reading Progress</AppText>
              </View>
              <SettingSwitch
                value={settings.autoSaveProgress}
                onValueChange={(v) => updateSettings({ autoSaveProgress: v })}
              />
            </View>
          </View>
        </View>

        {/* ── 2. ಅಪ್ಲಿಕೇಶನ್ ಮಾಹಿತಿ / App ──────────────────────── */}
        <View className="px-4 mt-6">
          <VStack spacing="xs" style={{ marginBottom: 16 }}>
            <AppText variant="heading3" weight="bold" className="text-[#3D2314]">
              ಅಪ್ಲಿಕೇಶನ್
            </AppText>
            <AppText style={{ color: '#9B7B6B', fontSize: 11 }}>App & Support</AppText>
          </VStack>

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
              {
                label: 'ಸ್ನೇಹಿತರನ್ನು ಆಹ್ವಾನಿಸಿ',
                sublabel: 'Invite Friends',
                icon: 'people-outline' as const,
                iconColor: '#10B981',
                iconBg: '#ECFDF5',
                action: handleInviteFriends,
              },
              {
                label: 'ಅಪ್ಲಿಕೇಶನ್ ರೇಟ್ ಮಾಡಿ',
                sublabel: 'Rate App',
                icon: 'star-outline' as const,
                iconColor: '#F59E0B',
                iconBg: '#FFFBEB',
                action: handleRateApp,
              },
              {
                label: 'ವೆಬ್‌ಸೈಟ್ ಭೇಟಿ ನೀಡಿ',
                sublabel: 'Visit Website',
                icon: 'globe-outline' as const,
                iconColor: '#2563EB',
                iconBg: '#EFF6FF',
                action: () => Linking.openURL('https://msvglobaltech.com'),
              },
              {
                label: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
                sublabel: 'Contact Us',
                icon: 'mail-outline' as const,
                iconColor: '#DC2626',
                iconBg: '#FEF2F2',
                action: () => Linking.openURL('mailto:msvglobaltech@gmail.com'),
              },
            ].map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={item.action}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#FFF5F0' : '#FFFBF5',
                  opacity: pressed ? 0.9 : 1,
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
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#8A3324',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="book" size={24} color="#FFFFFF" />
            </View>

            <AppText weight="bold" style={{ color: '#3D2314', fontSize: 15, marginBottom: 2 }}>
              ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ
            </AppText>
            <AppText style={{ color: '#9B7B6B', fontSize: 11, marginBottom: 14 }}>
              Siddhanta Shikamani App
            </AppText>

            <View style={{ height: 1, backgroundColor: '#EDD9A3', width: '100%', marginBottom: 14 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  backgroundColor: '#FDF0E8',
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                }}
              >
                <AppText weight="bold" style={{ color: '#8A3324', fontSize: 12 }}>
                  v1.0.1
                </AppText>
              </View>
              <AppText style={{ color: '#B0967A', fontSize: 11 }}>• MSV Global Tech</AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

