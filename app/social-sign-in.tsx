import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Text, View } from "tamagui";

export default function SocialSignIn() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const handleSocialLogin = async (provider: string) => {
        try {
            setLoading(prev => ({ ...prev, [provider]: true }));
            setError(null);
            
            await authClient.signIn.social({
                provider,
                callbackURL: "/" // Will redirect to home after successful sign-in
            });
            
            // If the authentication is successful without redirect
            router.replace("/");
        } catch (err: any) {
            setError(err?.message || `Failed to sign in with ${provider}`);
            console.error(`${provider} sign-in error:`, err);
        } finally {
            setLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Continue with</Text>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <Button
                onPress={() => handleSocialLogin("google")}
                disabled={loading["google"]} 
            >{loading["google"] ? "Signing in..." : "Google"}</Button>
            
            <View style={styles.spacer} />
            
            <Button
                onPress={() => handleSocialLogin("apple")}
                disabled={loading["apple"]} 
            >{loading["apple"] ? "Signing in..." : "Apple"}</Button>
            
            <View style={styles.spacer} />
            
            <Button
                onPress={() => handleSocialLogin("github")}
                disabled={loading["github"]} 
            >{loading["github"] ? "Signing in..." : "GitHub"}</Button>
            
            <View style={styles.footer}>
                <Text>Want to use email instead?</Text>
                <Text 
                    style={styles.link}
                    onPress={() => router.back()}
                >
                    Go back
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
    },
    spacer: {
        height: 15,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginBottom: 15,
    },
    footer: {
        marginTop: 40,
        alignItems: "center",
    },
    link: {
        color: "blue",
        marginTop: 5,
    }
});