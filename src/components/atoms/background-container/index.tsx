import React from 'react';
import { View, StyleSheet, ImageBackground, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';

interface BackgroundContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useImage?: boolean;
}

// 로컬 배경 이미지
const BACKGROUND_IMAGE = require('../../../../assets/background.jpg');

export function BackgroundContainer({ 
  children, 
  style,
  useImage = true
}: BackgroundContainerProps) {
  // 실제 로컬 이미지를 사용하는 경우
  if (useImage) {
    return (
      <View style={[styles.container, style]}>
        <ImageBackground
          source={BACKGROUND_IMAGE}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          {/* 이미지 위에 약간의 어두운 오버레이 추가 (글래스 효과를 더 잘 보이게 하기 위해) */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.3)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(0, 0, 0, 0.4)'
            ]}
            style={styles.overlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </ImageBackground>
      </View>
    );
  }

  // 폴백: 코드로 구현한 그라디언트 배경 (이미지 로딩 실패 시)
  return (
    <View style={[styles.container, style]}>
      <View style={styles.gradientBackground}>
        {/* Base dark layer */}
        <LinearGradient
          colors={['#000000', '#0a0a0a', '#000000']}
          style={styles.baseLayer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Curved gradient overlays */}
        <View style={styles.overlayContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(40, 40, 40, 0.4)', 'transparent']}
            style={[styles.curveOverlay, styles.curve1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(50, 50, 50, 0.3)', 'transparent']}
            style={[styles.curveOverlay, styles.curve2]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          />
        </View>

        {/* Vignette effect */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.6)',
            'transparent',
            'transparent',
            'rgba(0, 0, 0, 0.6)'
          ]}
          style={styles.vignette}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  baseLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  curveOverlay: {
    position: 'absolute',
    left: -100,
    right: -100,
    height: '100%',
  },
  curve1: {
    top: '-20%',
    height: '60%',
    transform: [{ rotate: '15deg' }, { scaleY: 2 }],
    opacity: 0.5,
  },
  curve2: {
    top: '30%',
    height: '50%',
    transform: [{ rotate: '-10deg' }, { scaleY: 1.5 }],
    opacity: 0.4,
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});