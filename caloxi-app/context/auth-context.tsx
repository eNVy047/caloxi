import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from 'expo-secure-store'; // Install this if not present, or use AsyncStorage
import { useRouter, useSegments } from "expo-router";

// Define the shape of the context
interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    signIn: (data: any) => Promise<void>;
    signUp: (data: any) => Promise<void>;
    signInWithGoogle: (idToken: string) => Promise<void>;
    signInWithApple: (identityToken: string, fullName?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to access the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Configure axios base URL
    // Replace with your actual backend URL (e.g., http://localhost:8000/api/v1/users for emulator)
    // For Android Emulator use 10.0.2.2 instead of localhost
    const API_URL = "http://192.168.166.5:8000/api/v1/users";

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Implement logic to check if user is already logged in (e.g., check token in storage)
                // For now, we'll just simulate checking
                // const token = await SecureStore.getItemAsync('accessToken');
                // if (token) {
                // Verify token with backend
                // setUser(userData);
                // }
            } catch (error) {
                console.error("Check user error with auth context", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);


    const signIn = async (data: any) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/login`, data);

            const { user, accessToken, refreshToken } = response.data.data;

            setUser(user);

            // Store tokens insecurely for now (web/dev) or implement secure storage
            // axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            router.replace("/(tabs)/home");
        } catch (error: any) {
            console.error("Login failed", error.response?.data || error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (data: any) => {
        try {
            setIsLoading(true);
            // data should include fullName, email, username, password
            const response = await axios.post(`${API_URL}/register`, data);

            // After signup, we might want to auto-login or redirect to login
            // For this flow, let's login immediately
            // const { email, password } = data;
            // await signIn({ email, password });

            router.replace("/(auth)/sign-in");

        } catch (error: any) {
            console.error("Registration failed", error.response?.data || error.message);
            throw error;
        } finally {
            setIsLoading(false)
        }
    };

    const signInWithGoogle = async (idToken: string) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/google`, { idToken });
            const { user, accessToken, refreshToken } = response.data.data;
            setUser(user);
            router.replace("/(tabs)/home");
        } catch (error: any) {
            console.error("Google Login failed", error.response?.data || error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithApple = async (identityToken: string, fullName?: string) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/apple`, {
                identityToken,
                user: fullName ? { name: { firstName: fullName.split(' ')[0], lastName: fullName.split(' ').slice(1).join(' ') } } : undefined
            });
            const { user, accessToken, refreshToken } = response.data.data;
            setUser(user);
            router.replace("/(tabs)/home");
        } catch (error: any) {
            console.error("Apple Login failed", error.response?.data || error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await axios.post(`${API_URL}/logout`);
            setUser(null);
            router.replace("/(auth)/welcome");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, signInWithGoogle, signInWithApple }}>
            {children}
        </AuthContext.Provider>
    );
};
