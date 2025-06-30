import { authClient } from "@/lib/auth-client";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Button, Text, View } from "tamagui";

export default function Index() {
	const { data: session, isPending, error } = authClient.useSession();
	const [loaded] = useFonts({
		Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
		InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
	});

	useEffect(() => {
		if (loaded) {
			// can hide splash screen here
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<View style={styles.container}>
			{isPending ? (
				<Text>Loading...</Text>
			) : error ? (
				<>
					<Text>Error loading session: {error.message}</Text>

					<Text>Please sign in or create an account</Text>
					<Button onPress={() => router.push("/sign-in")}>Sign In</Button>
					<Button onPress={() => router.push("/sign-up")}>Sign Up</Button>
				</>
			) : session ? (
				<>
					<Text>Welcome, {session?.user?.name || "User"}</Text>
					<Button
						onPress={async () => {
							await authClient.signOut();
						}}
					>
						Sign Out
					</Button>
				</>
			) : (
				<>
					<Text>Please sign in or create an account</Text>
					<Button onPress={() => router.push("/sign-in")}>Sign In</Button>
					<Button onPress={() => router.push("/sign-up")}>Sign Up</Button>
				</>
			)}
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
    button: {
        marginTop: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
});