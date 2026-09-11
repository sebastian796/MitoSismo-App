import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  dark?: boolean;
  rightElement?: ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  onBack,
  dark = false,
  rightElement,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const textColor = dark ? Colors.white : Colors.textPrimary;
  const backBgColor = dark ? 'rgba(255,255,255,0.15)' : Colors.surfaceAlt;

  return (
    <View style={[styles.container, dark && styles.darkContainer]}>
      {showBack && (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: backBgColor, opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={textColor} />
        </Pressable>
      )}
      
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>

      {rightElement ? (
        <View style={styles.right}>{rightElement}</View>
      ) : (
        showBack && <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },
  darkContainer: {
    backgroundColor: Colors.primaryDark,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
    ...Typography.titleSmall,
  },
  right: {
    marginLeft: Spacing.sm,
  },
  placeholder: {
    width: 36,
  },
});
