import { Stack } from 'expo-router';

export default function UsersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}