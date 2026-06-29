import { router } from "expo-router";
import { Button, View } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        title="Open Camera"
        onPress={() => router.push("/CameraScreen")}
      />
    </View>
  );
}
