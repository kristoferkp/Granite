import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Input, Text, View } from "tamagui";
 
export default function SignUp() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
 
    const handleSignUp = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name
            });
            
            if (error) {
                setErrorMsg(error.message || "Registration failed");
            } else if (data) {
                // Successfully signed up
                router.replace("/");
            }
        } catch (err: any) {
            setErrorMsg(err?.message || "An unexpected error occurred");
            console.error("Sign up error:", err);
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}
            
            <Input
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
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
                onPress={handleSignUp} 
                disabled={loading}
            >{loading ? "Creating account..." : "Sign Up"} </Button>
            
            <View style={styles.footer}>
                <Text>Already have an account? </Text>
                <Text onPress={() => router.push("/sign-in")} style={styles.link}>
                    Sign In
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