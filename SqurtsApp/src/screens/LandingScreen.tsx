import React, { useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, ScrollViewProps } from 'react-native';
import { Button } from '../components/Button';
import { colors, typography, rounded, spacing } from '../theme/theme';

interface Props {
  onGetStarted: () => void;
}

export const LandingScreen = ({ onGetStarted }: Props) => {
  const scrollRef = useRef<any>(null);
  const howItWorksY = useRef(0);

  const scrollToHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: howItWorksY.current, animated: true });
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ INTELLIGENT MOVEMENT ALARM</Text>
        </View>
        <Text style={styles.title}>Your alarm won't stop until you move.</Text>
        <Text style={styles.subtitle}>
          Turn waking up into a simple movement challenge. Complete your squats and start your day.
        </Text>

        <View style={styles.flowPill}>
          <Text style={styles.flowText}>🔔 ALARM  →  🏃 MOVE  →  ✅ COMPLETE</Text>
        </View>

        <Button title="Get Started  ⚡" onPress={onGetStarted} style={{ marginBottom: 12 }} />
        <Button title="See How It Works" variant="outline" onPress={scrollToHowItWorks} />
      </View>

      {/* ── Problem Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MORNING REALITY CHECK</Text>
        <Text style={styles.sectionTitle}>Alarms are easy to ignore.</Text>
        <Text style={styles.sectionBody}>
          Tapping snooze takes zero brainpower. You stay trapped in grogginess.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardBadgeRed}>❌ The Traditional Trap</Text>
          <Text style={styles.cardStep}>1. Alarm sounds at 7:00 AM</Text>
          <Text style={styles.cardStep}>2. Subconscious swipe to snooze</Text>
          <Text style={styles.cardStep}>3. Wake up exhausted at 7:45 AM</Text>
        </View>

        <View style={[styles.card, styles.cardGreen]}>
          <Text style={styles.cardBadgeGreen}>⚡ The Squrts Rule</Text>
          <Text style={styles.cardStep}>✓ Alarm triggers energetic tone</Text>
          <Text style={styles.cardStep}>✓ Camera validates 10 clean squats</Text>
          <Text style={styles.cardStep}>✓ Blood pumping, heart rate up — fully awake</Text>
        </View>
      </View>

      {/* ── How It Works ── */}
      <View
        style={styles.section}
        onLayout={e => { howItWorksY.current = e.nativeEvent.layout.y; }}
      >
        <Text style={styles.sectionLabel}>SIMPLE DAILY RITUAL</Text>
        <Text style={styles.sectionTitle}>Four steps to a better morning.</Text>

        {[
          { n: '01', icon: '⚙️', title: 'Set your alarm', body: 'Choose your wake-up time and assign a squat target (e.g., 10 reps at 7:00 AM).', tag: 'Target: 10 reps  •  7:00 AM' },
          { n: '02', icon: '🔔', title: 'Your alarm rings', body: 'A gentle ramp-up into a firm upbeat tone prompts you out of bed.', tag: 'Volume: High  •  Ringing' },
          { n: '03', icon: '📷', title: 'Complete your squats', body: 'Computer vision validates every full-depth repetition in real time.', tag: 'Real-time feedback  •  Pose AI' },
          { n: '04', icon: '☀️', title: 'Alarm stops', body: "Hit your goal and silence the chime. You're standing, oxygenated, ready.", tag: 'Result  •  Day Won' },
        ].map(step => (
          <View key={step.n} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNum}>{step.n}</Text>
              <Text style={styles.stepIcon}>{step.icon}</Text>
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
            <View style={styles.stepTag}>
              <Text style={styles.stepTagText}>{step.tag}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Final CTA ── */}
      <View style={[styles.section, styles.finalCta]}>
        <Text style={styles.sectionLabel}>READY FOR BETTER MORNINGS?</Text>
        <Text style={styles.ctaTitle}>Wake up. Move. Start your day.</Text>
        <Text style={styles.sectionBody}>
          Replace the infinite snooze with ten simple morning squats.
        </Text>
        <Button title="Get Started — Free" onPress={onGetStarted} style={{ marginTop: 16 }} />
        <Text style={styles.credit}>Squrts • Built with passion by Dharm Gabani</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl },

  // Hero
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  badge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: rounded.full, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 20 },
  badgeText: { ...typography.labelSm, color: colors.primary, fontWeight: '700' },
  title: { ...typography.headlineLg, color: colors.textMain, textAlign: 'center', marginBottom: 16 },
  subtitle: { ...typography.bodyLg, color: colors.textMuted, textAlign: 'center', marginBottom: 28 },
  flowPill: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.full, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 28 },
  flowText: { ...typography.labelMd, color: colors.primaryContainer },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.labelSm, color: colors.primary, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  sectionTitle: { ...typography.headlineMd, color: colors.textMain, marginBottom: 12 },
  sectionBody: { ...typography.bodyMd, color: colors.textMuted, marginBottom: 16 },

  // Cards
  card: { backgroundColor: colors.surfaceContainerHigh, borderRadius: rounded.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 12 },
  cardGreen: { borderColor: colors.secondary + '66', borderWidth: 2 },
  cardBadgeRed: { ...typography.labelMd, color: colors.error, marginBottom: 10 },
  cardBadgeGreen: { ...typography.labelMd, color: colors.secondary, marginBottom: 10 },
  cardStep: { ...typography.bodySm, color: colors.textMuted, marginBottom: 4 },

  // Steps
  stepCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: rounded.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: 12 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepNum: { ...typography.headlineMd, color: colors.primaryContainer, opacity: 0.4, fontWeight: '700' },
  stepIcon: { fontSize: 22 },
  stepTitle: { ...typography.headlineSm, color: colors.textMain, marginBottom: 6 },
  stepBody: { ...typography.bodySm, color: colors.textMuted, marginBottom: 10 },
  stepTag: { backgroundColor: colors.surfaceContainerLow, borderRadius: rounded.md, paddingHorizontal: 10, paddingVertical: 5 },
  stepTagText: { ...typography.labelSm, color: colors.textMuted },

  // Final CTA
  finalCta: { backgroundColor: colors.surfaceContainerLow, borderRadius: rounded.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center' },
  ctaTitle: { ...typography.headlineLg, color: colors.textMain, textAlign: 'center', marginBottom: 10 },
  credit: { ...typography.bodySm, color: colors.textMuted, marginTop: 20 },
});
