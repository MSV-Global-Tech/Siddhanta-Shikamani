import { Slot } from 'expo-router';
import { TabLayout } from '@/components/navigation/BottomNavigation';

export default function TabsLayout() {
  return (
    <TabLayout>
      <Slot />
    </TabLayout>
  );
}
