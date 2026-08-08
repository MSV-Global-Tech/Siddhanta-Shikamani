import React, { useState } from 'react';
import { View, Pressable, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer, HStack, VStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { SettingItem, SettingSwitch } from '@/components/inputs/Inputs';
import { Button } from '@/components/buttons/Button';
import { Header } from '@/components/common/Common';
import { useAppStore, defaultProfile } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, haptics } from '@/utils';
import { CANTO_KEYS } from '@/constants';
import { storage } from '@/services/storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  // ಸಿಸ್ಟಂ ನ್ಯಾವಿಗೇಶನ್‌ಗೆ ತಕ್ಕಂತೆ ಕೆಳ ಅಂತರ
  const bottomInset = Math.max(insets.bottom, 8);
  const {
    settings,
    updateSettings,
    resetSettings,
    profile,
    updateProfile,
    resetAllData,
    bookmarks,
    readingProgress,
    clearRecentChapters,
  } = useAppStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [fontSize, setFontSize] = useState(settings.fontSize);

  const handleResetData = () => {
    Alert.alert(
      'ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ರೀಸೆಟ್ ಮಾಡಿ',
      'ಈ ಕ್ರಿಯೆಯು ಬುಕ್ಮಾರ್ಕ್‌ಗಳನ್ನು, ಪ್ರಗತಿಯನ್ನು ಮತ್ತು ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸುತ್ತದೆ. ಇದನ್ನು ಮುಂದುವರೆಸಬೇಕೇ?',
      [
        { text: 'ರದ್ದು', style: 'cancel' },
        {
          text: 'ರೀಸೆಟ್ ಮಾಡಿ',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            resetAllData();
            haptics.warning();
            setShowResetConfirm(false);
            setTimeout(() => {
              router.replace('/');
            }, 500);
          },
        },
      ]
    );
  };

  const fontSizeLabels: Record<number, string> = {
    14: 'ಸಣ್ಣ',
    16: 'ಸಾಮಾನ್ಯ',
    17: 'ಸರಾಸರಿ',
    19: 'ದೊಡ್ಡ',
    21: 'ವಿಶಾಲ',
    24: 'ಬಹಳ ದೊಡ್ಡ',
  };

  return (
    <ScreenContainer edges={['top']}>
      <Header
        title={LOCAL_STRINGS.settingsTitle}
        showBack
        onBack={() => router.back()}
      />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 40 }}>
          <View className="px-6 pt-4">
            <View className="mb-7">
              <View className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border-light">
                <AppText variant="overline" color="muted" weight="semibold" className="uppercase tracking-wider px-5 pt-5 pb-2">
                  {LOCAL_STRINGS.display}
                </AppText>

                <SettingItem
                  icon="text-outline"
                  title={LOCAL_STRINGS.fontSize}
                  description={fontSizeLabels[fontSize] || `${toKannadaNumerals(fontSize)}px`}
                  borderTop={false}
                  rightContent={
                    <HStack spacing="xs">
                      <Pressable
                        onPress={() => {
                          const next = Math.max(CANTO_KEYS.app.MIN_FONT_SIZE, fontSize - 1);
                          setFontSize(next);
                          updateSettings({ fontSize: next });
                          haptics.light();
                        }}
                        className="w-9 h-9 rounded-xl items-center justify-center bg-background-soft"
                        disabled={fontSize <= CANTO_KEYS.app.MIN_FONT_SIZE}
                      >
                        <Ionicons
                          name="remove"
                          size={18}
                          color={fontSize <= CANTO_KEYS.app.MIN_FONT_SIZE ? '#D4BFA3' : '#7A5C48'}
                        />
                      </Pressable>
                      <View className="w-14 h-9 rounded-xl items-center justify-center bg-primary-subtle">
                        <AppText variant="bodySmall" weight="bold" color="primary">
                          {toKannadaNumerals(fontSize)}
                        </AppText>
                      </View>
                      <Pressable
                        onPress={() => {
                          const next = Math.min(CANTO_KEYS.app.MAX_FONT_SIZE, fontSize + 1);
                          setFontSize(next);
                          updateSettings({ fontSize: next });
                          haptics.light();
                        }}
                        className="w-9 h-9 rounded-xl items-center justify-center bg-background-soft"
                        disabled={fontSize >= CANTO_KEYS.app.MAX_FONT_SIZE}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={fontSize >= CANTO_KEYS.app.MAX_FONT_SIZE ? '#D4BFA3' : '#7A5C48'}
                        />
                      </Pressable>
                    </HStack>
                  }
                />

                <SettingItem
                  icon="reader-outline"
                  title={LOCAL_STRINGS.fontFamily}
                  description={settings.fontFamily === 'serif' ? 'ಸೆರಿಫ್ ಲಿಪಿ (ಓದಲು ಸೌಕರ್ಯ)' : 'ಸ್ಯಾನ್ಸ್-ಸೆರಿಫ್ ಲಿಪಿ (ಸಮಂಜಸವಾದ)'}
                  rightContent={
                    <Pressable
                      onPress={() => {
                        updateSettings({
                          fontFamily: settings.fontFamily === 'serif' ? 'sans' : 'serif',
                        });
                        haptics.selection();
                      }}
                      className="w-[76px] h-10 rounded-2xl bg-background-soft p-1"
                    >
                      <View
                        className={clsx(
                          'w-[34px] h-8 rounded-xl bg-primary-default items-center justify-center shadow-soft transition-transform',
                          settings.fontFamily === 'serif' ? 'translate-x-0' : 'translate-x-9',
                        )}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          color="inverted"
                        >
                          {settings.fontFamily === 'serif' ? 'ಸ್' : 'ಎಸ್'}
                        </AppText>
                      </View>
                    </Pressable>
                  }
                />

                <SettingItem
                  icon="globe-outline"
                  title={LOCAL_STRINGS.language}
                  description="ಕನ್ನಡ (ನಿಶ್ಚಿತ)"
                />
              </View>
            </View>

            <View className="mb-7">
              <View className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border-light">
                <AppText variant="overline" color="muted" weight="semibold" className="uppercase tracking-wider px-5 pt-5 pb-2">
                  {LOCAL_STRINGS.reading}
                </AppText>

                <SettingItem
                  icon="language-outline"
                  title={LOCAL_STRINGS.showSanskrit}
                  borderTop={false}
                  rightContent={
                    <SettingSwitch
                      value={settings.showSanskrit}
                      onValueChange={(v) => updateSettings({ showSanskrit: v })}
                    />
                  }
                />

                <SettingItem
                  icon="document-text-outline"
                  title={LOCAL_STRINGS.showTranslation}
                  rightContent={
                    <SettingSwitch
                      value={settings.showTranslation}
                      onValueChange={(v) => updateSettings({ showTranslation: v })}
                    />
                  }
                />

                <SettingItem
                  icon="chatbox-ellipses-outline"
                  title={LOCAL_STRINGS.showCommentary}
                  rightContent={
                    <SettingSwitch
                      value={settings.showCommentary}
                      onValueChange={(v) => updateSettings({ showCommentary: v })}
                    />
                  }
                />

                <SettingItem
                  icon="save-outline"
                  title={LOCAL_STRINGS.autoSave}
                  description="ನೀವು ಓದುವ ಪ್ರತಿ ಶ್ಲೋಕವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಉಳಿಸಿ"
                  rightContent={
                    <SettingSwitch
                      value={settings.autoSaveProgress}
                      onValueChange={(v) => updateSettings({ autoSaveProgress: v })}
                    />
                  }
                />
              </View>
            </View>

            <View className="mb-7">
              <View className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border-light">
                <AppText variant="overline" color="muted" weight="semibold" className="uppercase tracking-wider px-5 pt-5 pb-2">
                  {LOCAL_STRINGS.general}
                </AppText>

                <SettingItem
                  icon="radio-button-on-outline"
                  title={LOCAL_STRINGS.vibration}
                  description={LOCAL_STRINGS.vibrationDesc}
                  borderTop={false}
                  rightContent={
                    <SettingSwitch
                      value={settings.vibrationEnabled}
                      onValueChange={(v) => updateSettings({ vibrationEnabled: v })}
                    />
                  }
                />

                <SettingItem
                  icon="refresh-outline"
                  title="ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಮರಳಿ ಸ್ಥಾಪಿಸಿ"
                  description="ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಪೂರ್ವನಿಯೋಜಿತ ಮೌಲ್ಯಗಳಿಗೆ ಮರಳಿಸಿ"
                  onPress={() => {
                    Alert.alert(
                      'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ರೀಸೆಟ್ ಮಾಡಿ',
                      'ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಪೂರ್ವನಿಯೋಜಿತ ಮೌಲ್ಯಗಳಿಗೆ ಮರಳಿಸಲಾಗುತ್ತದೆ. ಖಚಿತವೇ?',
                      [
                        { text: 'ರದ್ದು', style: 'cancel' },
                        {
                          text: 'ರೀಸೆಟ್ ಮಾಡಿ',
                          style: 'destructive',
                          onPress: () => {
                            resetSettings();
                            setFontSize(17);
                            haptics.success();
                          },
                        },
                      ]
                    );
                  }}
                />

                <SettingItem
                  icon="trash-bin-outline"
                  title="ಇತ್ತೀಚಿನ ಅಧ್ಯಾಯಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ"
                  description={`${toKannadaNumerals(useAppStore.getState().recentChapters.length)} ಇತ್ತೀಚಿನ ವಾಚನಗಳು`}
                  onPress={() => {
                    clearRecentChapters();
                    haptics.success();
                  }}
                />

                <SettingItem
                  icon="alert-circle-outline"
                  title="ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ರೀಸೆಟ್ ಮಾಡಿ"
                  description="ಬುಕ್ಮಾರ್ಕ್‌ಗಳು, ಪ್ರಗತಿ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು - ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ"
                  danger
                  onPress={() => setShowResetConfirm(true)}
                />
              </View>
            </View>

            <View className="mb-7">
              <View className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border-light">
                <AppText variant="overline" color="muted" weight="semibold" className="uppercase tracking-wider px-5 pt-5 pb-2">
                  ಮಾಹಿತಿ
                </AppText>

                <SettingItem
                  icon="information-circle-outline"
                  title="ಪ್ರಗತಿ ಸಾರಾಂಶ"
                  description={`${toKannadaNumerals(readingProgress.filter((p) => p.completed).length)} ಅಧ್ಯಾಯಗಳು • ${toKannadaNumerals(bookmarks.length)} ಬುಕ್ಮಾರ್ಕ್‌ಗಳು`}
                  borderTop={false}
                />

                <SettingItem
                  icon="book-outline"
                  title="ಪಠ್ಯ ಮಾಹಿತಿ"
                  description={`8 ಅಧ್ಯಾಯಗಳು • ${toKannadaNumerals(47 + 72 + 43 + 42 + 29 + 47 + 30 + 28)} ಶ್ಲೋಕಗಳು`}
                />

                <SettingItem
                  icon="help-circle-outline"
                  title={LOCAL_STRINGS.about}
                  description="ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ ಹೆಚ್ಚು ತಿಳಿಯಿರಿ"
                  onPress={() => setShowAbout(true)}
                />

                <SettingItem
                  icon="share-social-outline"
                  title={LOCAL_STRINGS.shareApp}
                  description="ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ"
                  onPress={() => haptics.light()}
                />

                <SettingItem
                  icon="star-outline"
                  title={LOCAL_STRINGS.rateApp}
                  description="5 ನಕ್ಷತ್ರಗಳನ್ನು ನೀಡಿ"
                  onPress={() => haptics.light()}
                />
              </View>
            </View>

            <View className="mb-7">
              <View className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border-light">
                <AppText variant="overline" color="muted" weight="semibold" className="uppercase tracking-wider px-5 pt-5 pb-2">
                  ಕಾನೂನು
                </AppText>

                <SettingItem
                  icon="shield-checkmark-outline"
                  title={LOCAL_STRINGS.privacyPolicy}
                  borderTop={false}
                  onPress={() => haptics.light()}
                />

                <SettingItem
                  icon="document-text-outline"
                  title={LOCAL_STRINGS.termsOfService}
                  onPress={() => haptics.light()}
                />
              </View>
            </View>

            <Pressable
              onPress={() => setShowAbout(true)}
              className="items-center mb-5"
            >
              <LinearGradient
                colors={['#A0522D', '#7A2E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-16 h-16 rounded-[22px] items-center justify-center mb-3"
                style={{
                  shadowColor: '#8A3324',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <Ionicons name="book" size={28} color="#FFFFFF" />
              </LinearGradient>
              <AppText variant="title" weight="bold">
                {LOCAL_STRINGS.appName}
              </AppText>
              <AppText variant="caption" color="muted">
                {LOCAL_STRINGS.version} 1.0.0
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={showResetConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/50"
            onPress={() => setShowResetConfirm(false)}
          />
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-elevated">
            <View className="w-16 h-16 rounded-2xl bg-[#FBEAE7] items-center justify-center mb-5 self-center">
              <Ionicons name="alert-circle-outline" size={32} color="#C0392B" />
            </View>
            <AppText variant="title" weight="bold" align="center" className="mb-2">
              ಖಚಿತವೇ?
            </AppText>
            <AppText variant="body" color="muted" align="center" className="mb-6">
              {bookmarks.length} ಬುಕ್ಮಾರ್ಕ್‌ಗಳು, {readingProgress.length} ಪ್ರಗತಿ ದಾಖಲೆಗಳು ಮತ್ತು ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸಲಾಗುತ್ತವೆ.
            </AppText>
            <HStack spacing="sm">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => setShowResetConfirm(false)}
              >
                ರದ್ದು
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon="trash-outline"
                onPress={handleResetData}
              >
                ರೀಸೆಟ್
              </Button>
            </HStack>
          </View>
        </View>
      </Modal>

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
                {LOCAL_STRINGS.version} 1.0.0
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
                  <HStack spacing="sm">
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
                  </HStack>
                </VStack>
              </VStack>
            </ScrollView>

            <Button
              variant="gradient"
              fullWidth
              icon="close"
              onPress={() => setShowAbout(false)}
            >
              ಮುಚ್ಚಿ
            </Button>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
