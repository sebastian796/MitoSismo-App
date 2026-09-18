import React, { ReactNode } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, Spacing, Typography, Radii, Shadows } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyle = (pressed: boolean) => {
    switch (variant) {
      case 'primary':
        return [
          styles.primary,
          pressed && styles.primaryPressed,
          disabled && styles.disabled,
        ];
      case 'accent':
        return [
          styles.accent,
          pressed && styles.accentPressed,
          disabled && styles.disabled,
        ];
      case 'secondary':
        return [
          styles.secondary,
          pressed && styles.secondaryPressed,
          disabled && styles.disabled,
        ];
      case 'outline':
        return [
          styles.outline,
          pressed && styles.outlinePressed,
          disabled && styles.disabledOutline,
        ];
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'accent':
        return styles.textLight;
      case 'secondary':
        return styles.textDark;
      case 'outline':
        return styles.textPrimary;
      default:
        return styles.textLight;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        getVariantStyle(pressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? Colors.primary : Colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              Typography.button,
              getTextStyle(),
              icon ? styles.textWithIcon : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  small: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  primaryPressed: {
    backgroundColor: Colors.primaryDark,
    opacity: 0.9,
  },
  accent: {
    backgroundColor: Colors.accent,
    ...Shadows.sm,
  },
  accentPressed: {
    backgroundColor: Colors.accentDark,
    opacity: 0.9,
  },
  secondary: {
    backgroundColor: Colors.surfaceAlt,
  },
  secondaryPressed: {
    backgroundColor: Colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
  outlinePressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  disabled: {
    backgroundColor: Colors.borderDark,
    opacity: 0.6,
  },
  disabledOutline: {
    borderColor: Colors.border,
    opacity: 0.5,
  },
  textLight: {
    color: Colors.white,
  },
  textDark: {
    color: Colors.textPrimary,
  },
  textPrimary: {
    color: Colors.primary,
  },
  textWithIcon: {
    marginLeft: Spacing.sm,
  },
});
