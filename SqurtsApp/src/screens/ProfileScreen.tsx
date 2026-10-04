import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
          <Text style={styles.name}>Dharm Gabani</Text>
          <Text style={styles.email}>dharm@example.com</Text>
        </View>
        <Button title="Settings" variant="outline" onPress={() => {}} style={{ marginBottom: 16 }} />
        <Button title="Log Out" variant="outline" onPress={() => {}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  avatarContainer: { alignItems: 'center', marginVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceContainer, marginBottom: 16 },
  name: { ...typography.headlineSm, color: colors.textMain },
  email: { ...typography.bodyMd, color: colors.textMuted }
});
