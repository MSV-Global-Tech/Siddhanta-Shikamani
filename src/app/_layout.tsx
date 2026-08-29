import '@/global.css';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppLoading } from '@/hooks/useAppLoading';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { UpdateModal } from '@/components/UpdateModal';
import { colors } from '@/theme';

export default function RootLayout() {
  const { appIsReady, onLayoutRootView } = useAppLoading();
  const { updateAvailable, remoteVersionInfo, isApplyingOTA } = useAppUpdate();

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background.default }} onLayout={onLayoutRootView}>
          <StatusBar style="dark" backgroundColor="#FDFAF4" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.background.soft,
              },
              animation: 'slide_from_right',
              animationDuration: 250,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="reading/[id]"
              options={{
                headerShown: false,
                animation: 'fade_from_bottom',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="admin"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          </Stack>
        </View>

        {/* Update modal — rendered outside the main View so it overlays everything */}
        <UpdateModal
          visible={updateAvailable || !!isApplyingOTA}
          remoteVersionInfo={remoteVersionInfo}
          isApplyingOTA={isApplyingOTA}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
