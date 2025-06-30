import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Input, Text, View } from "tamagui";
 
export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
 
    const handleLogin = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });
            
            if (error) {
                setErrorMsg(error.message || "Authentication failed");
            } else if (data) {
                // Successfully signed in
                router.replace("/");
            }
        } catch (err: any) {
            setErrorMsg(err?.message || "An unexpected error occurred");
            console.error("Sign in error:", err);
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}
            
            <Input
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <Input
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button
                onPress={handleLogin} 
                disabled={loading}
            >{loading ? "Signing in..." : "Sign In"}</Button>
            
            <View style={styles.footer}>
                <Text>Don't have an account? </Text>
                <Text onPress={() => router.push("/sign-up")} style={styles.link}>
                    Sign Up
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
    },
});