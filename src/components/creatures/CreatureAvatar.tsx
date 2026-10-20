import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { API_BASE_URL } from "../../config/api";
import { Colors } from "../../constants/theme";
import { Ignis } from "../icons/Ignis";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  nombre?: string | null;
  elemento?: string | null;
  imageUrl?: string | null;
  size?: number;
  allowIllustration?: boolean;
};

const ELEMENT_STYLE: Record<
  string,
  {
    icon: IconName;
    color: string;
    bg: string;
  }
> = {
  FUEGO: {
    icon: "flame",
    color: "#E8521A",
    bg: "#FFF3E0",
  },
  AGUA: {
    icon: "water",
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  TIERRA: {
    icon: "leaf",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  AIRE: {
    icon: "cloud",
    color: "#5E35B1",
    bg: "#EDE7F6",
  },
};

function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl || !imageUrl.trim()) {
    return null;
  }

  const path = imageUrl.trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  try {
    const origin = new URL(API_BASE_URL).origin;
    const resolved = new URL(path, origin + "/");
    return ["http:", "https:"].includes(resolved.protocol)
      ? resolved.href
      : null;
  } catch {
    return null;
  }
}

export function CreatureAvatar({
  nombre,
  elemento,
  imageUrl,
  size = 64,
  allowIllustration = true,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUri = resolveImageUrl(imageUrl);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const normalizedName = nombre?.trim().toLowerCase() ?? "";

  const normalizedElement = elemento?.trim().toUpperCase() ?? "";

  if (imageUri && !imageFailed) {
    return (
      <Image
        key={imageUri}
        source={{
          uri: imageUri,
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="contain"
        onError={() => {
          setImageFailed(true);
        }}
      />
    );
  }

  if (allowIllustration && normalizedName === "ignis")
    return <Ignis size={size} />;

  const elementStyle = ELEMENT_STYLE[normalizedElement];

  return (
    <View
      style={[
        styles.emblem,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: elementStyle?.bg ?? Colors.surfaceAlt,
        },
      ]}
    >
      <Ionicons
        name={elementStyle?.icon ?? "help-circle-outline"}
        size={size * 0.5}
        color={elementStyle?.color ?? Colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emblem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
