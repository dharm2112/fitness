import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { colors, typography, rounded, spacing } from '../theme/theme';

export const ProfileScreen = () => {
  const { userProfile, updateUserProfile } = useAppContext();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [backendIp, setBackendIp] = useState(userProfile.backendIp);

  const handleSave = () => {
    updateUserProfile({
      name,
      email,
      backendIp,
    });
    Alert.alert('Success', 'Profile settings saved!');
  };

  return (
    <View style={styles.container}>
      <Header title="Profile & Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nameLabel}>{name || 'Fitness Hero'}</Text>
        </View>

        <Text style={styles.sectionTitle}>User Info</Text>
        
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>App Configuration</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔌</Text>
          <Text style={styles.infoText}>
            Enter the local IP address of the PC running the Python AI Backend.
            (e.g. 192.168.1.5 or 10.0.2.2 for emulator)
          </Text>
        </View>

        <Text style={styles.inputLabel}>Backend IP Address</Text>
        <TextInput
          style={styles.input}
          value={backendIp}
          onChangeText={setBackendIp}
          placeholder="192.168.x.x"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
        />

        <Button title="Save Changes" onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  avatarContainer: { alignItems: 'center', marginVertical: spacing.xl },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 48, fontWeight: '800', color: colors.onPrimary },
  nameLabel: { ...typography.headlineSm, color: colors.textMain },
  
  sectionTitle: { ...typography.titleMd, color: colors.secondary, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '700' },
  
  inputLabel: { ...typography.labelMd, color: colors.textMain, marginBottom: 8 },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.md,
    padding: spacing.md,
    color: colors.textMain,
    ...typography.bodyMd,
    marginBottom: spacing.md,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondaryContainer + '22',
    padding: spacing.md,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.secondaryContainer + '55',
    marginBottom: spacing.md,
    gap: 8,
  },
  infoIcon: { fontSize: 20 },
  infoText: { ...typography.bodySm, color: colors.textMain, flex: 1, lineHeight: 18 },

  saveBtn: { marginTop: spacing.xl },
});
