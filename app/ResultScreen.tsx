import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { ANALYSIS_PROMPT, analyzeImage, imageToBase64 } from "../lib/gemini";

type Analysis = {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string;
};

export default function ResultScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (photoUri) {
      runAnalysis();
    }
  }, []);

  async function runAnalysis() {
    try {
      setLoading(true);
      setError(null);

      console.log("Photo URI:", photoUri);

      const base64 = await imageToBase64(photoUri);

      console.log("Base64 length:", base64.length);

      const result = await analyzeImage(base64, ANALYSIS_PROMPT);

      let text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      // Remove markdown code fences if Gemini returns them
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(text);

      setAnalysis(parsed);
    } catch (err) {
      console.error(err);

      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />

        <Text style={styles.loading}>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.centered}>
        <Text>No analysis available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Objects</Text>

      {analysis.objects.map((item, index) => (
        <Text key={index} style={styles.item}>
          • {item}
        </Text>
      ))}

      <Text style={styles.title}>Context</Text>

      <Text style={styles.body}>{analysis.context}</Text>

      <Text style={styles.title}>Activities</Text>

      <Text style={styles.body}>{analysis.activities}</Text>

      <Text style={styles.title}>Recommendations</Text>

      <Text style={styles.body}>{analysis.recommendations}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loading: {
    marginTop: 15,
    color: "#5A6472",
    fontSize: 16,
  },

  error: {
    color: "#B3261E",
    textAlign: "center",
    fontSize: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: "#1F2A44",
  },

  item: {
    fontSize: 16,
    marginTop: 8,
  },

  body: {
    fontSize: 16,
    marginTop: 8,
    color: "#2B2F38",
    lineHeight: 24,
  },
});
