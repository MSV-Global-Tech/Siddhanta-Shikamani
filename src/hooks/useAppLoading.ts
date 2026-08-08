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
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          // Hide native splash immediately so custom JS splash takes over seamlessly
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            // ignore
          }
          if (!cancelled) setAppIsReady(true);
          return;
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) setAppIsReady(true);
      }
    }
    prepare();

    // Safety fallback: force ready after 5s even if fonts hang
    timeoutRef.current = setTimeout(async () => {
      if (!cancelled) {
        try { await SplashScreen.hideAsync(); } catch (e) { /* ignore */ }
        setAppIsReady(true);
      }
    }, 5000);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fontsLoaded, fontError]);

  // Kept for API compatibility but hideAsync is now called in the effect above
  const onLayoutRootView = useCallback(() => {}, []);

  return {
    appIsReady,
    onLayoutRootView,
    fontsLoaded: !!fontsLoaded,
    fontError: !!fontError,
  };
}
