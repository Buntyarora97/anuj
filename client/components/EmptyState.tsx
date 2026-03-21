import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface EmptyStateProps {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}

export function EmptyState({ image, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing["4xl"],
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
