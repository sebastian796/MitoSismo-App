import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { type ComponentProps, useMemo } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
  requiresAuth?: boolean;
}

const TAB_ITEMS: readonly TabConfig[] = [
  {
    name: "index",
    title: "Inicio",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  {
    name: "map",
    title: "Mapa",
    activeIcon: "map",
    inactiveIcon: "map-outline",
  },
  {
    name: "recent",
    title: "Sismos",
    activeIcon: "pulse",
    inactiveIcon: "pulse-outline",
  },
  {
    name: "missions",
    title: "Misiones",
    activeIcon: "star",
    inactiveIcon: "star-outline",
    requiresAuth: true,
  },
  {
    name: "profile",
    title: "Perfil",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
] as const;

export default function TabsLayout() {
  const { user, requireAuth } = useAuth();
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo(() => {
    const bottomInset = Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 8);

    return {
      headerShown: false,
      lazy: true,
      animation: "fade" as const,
      transitionSpec: {
        animation: "timing" as const,
        config: { duration: 180 },
      },
      tabBarActiveTintColor: String(Colors.primary),
      tabBarInactiveTintColor: String(Colors.textSecondary),
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 56 + bottomInset,
        paddingBottom: bottomInset,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600" as const,
      },
    };
  }, [insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          listeners={
            tab.requiresAuth
              ? {
                  tabPress: (event) => {
                    if (!user) {
                      event.preventDefault();
                      requireAuth();
                    }
                  },
                }
              : undefined
          }
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, size }) => {
              const iconColor = String(
                focused ? Colors.primary : Colors.textSecondary,
              );
              const iconSize = typeof size === "number" ? Math.max(20, size - 2) : 22;

              return (
                <Ionicons
                  name={focused ? tab.activeIcon : tab.inactiveIcon}
                  size={iconSize}
                  color={iconColor}
                  style={{ color: iconColor }}
                />
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}