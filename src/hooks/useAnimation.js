/**
 * useAnimation Hook
 * Provides smooth animations and transitions
 * Enables micro-interactions and polish
 */

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { animation } from '../theme/enhancedTheme';

/**
 * Create fade in animation
 */
export const useFadeIn = (initialValue = 0, duration = animation.normal) => {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeAnim;
};

/**
 * Create scale animation (grow/shrink)
 */
export const useScaleIn = (initialScale = 0.8, duration = animation.normal) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, []);

  return scaleAnim;
};

/**
 * Create slide in animation
 */
export const useSlideIn = (
  direction = 'down',
  initialDistance = 100,
  duration = animation.normal
) => {
  const slideAnim = useRef(new Animated.Value(initialDistance)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);

  const directions = {
    up: { transform: [{ translateY: slideAnim }] },
    down: { transform: [{ translateY: Animated.multiply(slideAnim, -1) }] },
    left: { transform: [{ translateX: slideAnim }] },
    right: { transform: [{ translateX: Animated.multiply(slideAnim, -1) }] },
  };

  return directions[direction] || directions.up;
};

/**
 * Bounce animation for buttons
 */
export const useBounce = () => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: animation.fast / 2,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: animation.fast / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scaleValue: bounceAnim, bounce };
};

/**
 * Pulse animation (opacity)
 */
export const usePulse = (duration = 2000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [duration]);

  return { opacity: pulseAnim };
};

/**
 * Spin/Rotate animation
 */
export const useSpin = (duration = 2000) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, [duration]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { transform: [{ rotate: spin }] };
};

/**
 * Combined scale press animation
 */
export const usePressScale = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  return { scaleValue: scaleAnim, onPressIn, onPressOut };
};

export default {
  useFadeIn,
  useScaleIn,
  useSlideIn,
  useBounce,
  usePulse,
  useSpin,
  usePressScale,
};