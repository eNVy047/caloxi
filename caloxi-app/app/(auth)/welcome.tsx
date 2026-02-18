import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../../context/auth-context';

export default function WelcomeScreen() {
    const router = useRouter();
    const { signInWithGoogle, signInWithApple } = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest({
        // Replace with your actual client IDs
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: 'YOUR_WEB_CLIENT_ID',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            if (id_token) {
                signInWithGoogle(id_token);
            }
        }
    }, [response]);

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (credential.identityToken) {
                const fullName = credential.fullName ? `${credential.fullName.givenName} ${credential.fullName.familyName}` : undefined;
                await signInWithApple(credential.identityToken, fullName);
            }
        } catch (e: any) {
            if (e.code === 'ERR_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                console.error(e);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {/* Background decoration or gradient could go here */}

            <View style={styles.contentContainer}>
                <Animated.View
                    entering={FadeInUp.delay(200).duration(1000).springify()}
                    style={styles.imageContainer}
                >
                    {/* Placeholder for Red Panda Mascot */}
                    {/* You can replace this with <LottieView /> or <Image /> */}
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(400).duration(1000).springify()}
                    style={styles.titleContainer}
                >
                    <Text style={styles.title}>Welcome Back!</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(600).duration(1000).springify()}
                    style={styles.buttonContainer}
                >
                    {/* Google Button */}
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Apple Button */}
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleAppleLogin}
                    >
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png' }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Email Button */}
                    <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        <Text style={styles.emailButtonText}>Continue with Email</Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray/white background
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-around',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    image: {
        width: 250,
        height: 250,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    buttonContainer: {
        marginTop: 20,
        gap: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 30, // Rounded full
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#9CA3AF',
        fontSize: 14,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6', // Lighter background for secondary action or darker for primary? Image shows white for Google/Apple, maybe dark/light for Email.
        // Let's stick to the design image if possible. Image shows "Continue with Email" as a button similar to others or primary.
        // In the user request image, "Continue with Email" is also a button.
        paddingVertical: 16,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signUpText: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
