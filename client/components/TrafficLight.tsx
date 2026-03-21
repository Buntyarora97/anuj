import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { GameColors, BorderRadius } from "@/constants/theme";
import { GameColor } from "@/constants/game";

interface TrafficLightProps {
  color: GameColor;
  isActive: boolean;
  isSelected: boolean;
  isResult: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TrafficLight({
  color,
  isActive,
  isSelected,
  isResult,
  onPress,
  disabled,
  size = 80,
}: TrafficLightProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isActive || isResult ? 1 : 0.3);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isResult) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        ),
        4,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) })
        ),
        4,
        true
      );
    } else if (isSelected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.6, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(isActive ? 0.8 : 0.3, { duration: 200 });
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isActive, isSelected, isResult]);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const lightColor =
    color === "red"
      ? GameColors.red
      : color === "yellow"
        ? GameColors.yellow
        : GameColors.green;

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        { width: size, height: size },
        animatedContainerStyle,
      ]}
      testID={`traffic-light-${color}`}
    >
      <Animated.View
        style={[
          styles.glow,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: lightColor,
          },
          animatedGlowStyle,
        ]}
      />
      <View
        style={[
          styles.light,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: lightColor,
            opacity: isActive || isSelected || isResult ? 1 : 1,
            borderWidth: isSelected ? 4 : 2,
            borderColor: isSelected ? "#FFFFFF" : "rgba(255,255,255,0.2)",
          },
        ]}
      />
      {isSelected && (
        <View
          style={[
            styles.selectionRing,
            {
              width: size + 8,
              height: size + 8,
              borderRadius: (size + 8) / 2,
              borderColor: "#FFFFFF",
            },
          ]}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    opacity: 0.3,
  },
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selected: {
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  selectionRing: {
    position: "absolute",
    borderWidth: 3,
    backgroundColor: "transparent",
  },
});
