import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/utils';

export function useHapticFeedback() {
  const vibrationEnabled = useAppStore((state) => state.settings.vibrationEnabled);

  return {
    light: () => vibrationEnabled && haptics.light(),
    medium: () => vibrationEnabled && haptics.medium(),
    heavy: () => vibrationEnabled && haptics.heavy(),
    success: () => vibrationEnabled && haptics.success(),
    warning: () => vibrationEnabled && haptics.warning(),
    error: () => vibrationEnabled && haptics.error(),
    selection: () => vibrationEnabled && haptics.selection(),
  };
}
