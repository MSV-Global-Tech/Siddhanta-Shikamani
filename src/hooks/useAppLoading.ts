import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  NotoSansKannada_400Regular,
  NotoSansKannada_500Medium,
  NotoSansKannada_600SemiBold,
  NotoSansKannada_700Bold,
} from '@expo-google-fonts/noto-sans-kannada';
import {
  NotoSerifKannada_400Regular,
  NotoSerifKannada_700Bold,
} from '@expo-google-fonts/noto-serif-kannada';

try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // ignore
}

export function useAppLoading() {
  const fontArgs: any[] =
    Platform.OS === 'web'
      ? [{}]
      : [
          {
            'NotoSansKannada-Regular': NotoSansKannada_400Regular,
            'NotoSansKannada-Medium': NotoSansKannada_500Medium,
            'NotoSansKannada-SemiBold': NotoSansKannada_600SemiBold,
            'NotoSansKannada-Bold': NotoSansKannada_700Bold,
            'NotoSerifKannada-Regular': NotoSerifKannada_400Regular,
            'NotoSerifKannada-Bold': NotoSerifKannada_700Bold,
          },
        ];

  const [fontsLoaded, fontError] = useFonts(...(fontArgs as [any]));
  const [appIsReady, setAppIsReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (fontsLoaded || fontError) {
      if (!cancelled) setAppIsReady(true);
    }

    // Safety fallback: force ready after 4s even if fonts hang
    timeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        setAppIsReady(true);
      }
    }, 4000);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // ignore
      }
    }
  }, [appIsReady]);

  return {
    appIsReady,
    onLayoutRootView,
    fontsLoaded: !!fontsLoaded,
    fontError: !!fontError,
  };
}
