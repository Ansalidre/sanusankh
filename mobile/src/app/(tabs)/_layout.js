import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { BookOpen, Ellipsis, House, IdCard, Siren } from "lucide-react-native";
import { T } from "@/components/ui/Text";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

const TABS = [
  { name: "index", key: "nav.home", icon: House },
  { name: "emergency", key: "nav.emergency", icon: Siren },
  { name: "guides", key: "nav.guides", icon: BookOpen },
  { name: "pass", key: "nav.pass", icon: IdCard },
  { name: "more", key: "nav.more", icon: Ellipsis },
];

/** Beschriftung bis zu zwei Zeilen, damit längere Übersetzungen bei 375 px nicht abgeschnitten werden. */
function TabLabel({ color, children }) {
  return (
    <T
      size={11}
      weight="semibold"
      color={color}
      align="center"
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.85}
      maxFontSizeMultiplier={1.3}
      android_hyphenationFrequency="none"
      style={{ lineHeight: 13 }}
    >
      {children}
    </T>
  );
}

export default function TabsLayout() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarActiveBackgroundColor: colors.accent,
        tabBarLabel: TabLabel,
        tabBarItemStyle: { borderRadius: 14, marginVertical: 4, paddingVertical: 2, paddingHorizontal: 0 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 70 + insets.bottom },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map(({ name, key, icon: TabIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(key),
            tabBarAccessibilityLabel: t(key),
            tabBarIcon: ({ color }) => <TabIcon size={24} color={color} strokeWidth={2.2} />,
          }}
        />
      ))}
    </Tabs>
  );
}
