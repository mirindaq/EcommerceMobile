import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();


    // Staggered dot animations
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dotAnim1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim3, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    setTimeout(() => animateDots(), 1200);
  }, []);


  return (
    <LinearGradient
      colors={['#ff4444', '#cc0000', '#990000', '#660000']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.patternDot,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: fadeAnim,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Logo Container with Enhanced Design */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoInner}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                alt="Cellphone Z Logo"
              />
            </View>
          </View>
        </Animated.View>

        {/* App Name with Better Typography */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>Cellphone Z</Text>
          <Text style={styles.tagline}>Cửa hàng điện thoại uy tín</Text>
          <Text style={styles.subtitle}>Chất lượng - Giá tốt - Dịch vụ tận tâm</Text>
        </Animated.View>

        {/* Enhanced Loading Indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logoInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '300',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});
