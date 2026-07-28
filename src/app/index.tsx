import { useEffect } from 'react';
import { View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { LOCAL_STRINGS } from '@/localization';
import { useAppStore } from '@/store/useAppStore';

export default function SplashScreen() {
  const router = useRouter();
  const checkAchievements = useAppStore((state) => state.checkAchievements);

  useEffect(() => {
    checkAchievements();
    const timer = setTimeout(() => {
      router.replace('/(tabs)/' as any);
    }, 2200);
    return () => clearTimeout(timer);
  }, [router, checkAchievements]);

  return (
    <ScreenContainer edges={[]} showStatusBar={false} className="bg-[#120A06]">
      {/* ಪೂರ್ಣ ಪರದೆಯ ದೇವಾಲಯ ಚಿತ್ರ — ಶೀರ್ಷಿಕೆ ಚಿತ್ರದಲ್ಲೇ ಇದೆ */}
      <ImageBackground
        source={require('../../assets/Splash1.jpg')}
        resizeMode="cover"
        className="flex-1 justify-end"
      >
        <View className="pb-6 items-center animate-fade-in">
          <HStack spacing="sm" className="mb-2">
            <View className="w-2 h-2 rounded-full bg-[#D4A24C] animate-pulse" />
            <View className="w-2 h-2 rounded-full bg-[#D4A24C] animate-pulse" style={{ animationDelay: 150 }} />
            <View className="w-2 h-2 rounded-full bg-[#D4A24C] animate-pulse" style={{ animationDelay: 300 }} />
          </HStack>
          <AppText variant="caption" className="text-[#C9A05C]/80">
            {LOCAL_STRINGS.loading}
          </AppText>
        </View>
      </ImageBackground>
    </ScreenContainer>
  );
}
