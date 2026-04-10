import React from 'react';
import {
  View, Text, Image, StyleSheet,
  Dimensions,
} from 'react-native';
import { Author } from '.';


const { width: SCREEN_W } = Dimensions.get('window');

interface ProfileHeaderProps {
  user:      Author & { email?: string };
  postCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, postCount }) => {
  const fullName  = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown';
  const initial   = user.firstName?.charAt(0).toUpperCase() ?? '?';
  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Member';

  return (
    <View style={styles.wrapper}>

      {/* ── Banner — deep navy → blue gradient via layered views ── */}
      <View style={styles.banner}>
        {/* Decorative circles for depth */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* ☕ Spill The Tea brand mark */}
        <Text style={styles.brandMark}>☕ Spill The Tea</Text>
      </View>

      {/* ── Card sits below banner, avatar overlaps banner ── */}
      <View style={styles.card}>

        {/* Avatar — overlaps the banner */}
        <View style={styles.avatarRing}>
          {user.profileImg?.url ? (
            <Image source={{ uri: user.profileImg.url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          {/* Online dot */}
          <View style={styles.onlineDot} />
        </View>

        {/* Name + role badge */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Email */}
        {user.email ? (
          <Text style={styles.email}>✉  {user.email}</Text>
        ) : null}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>☕</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>🏆</Text>
            <Text style={styles.statLabel}>Top Spiller</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const BANNER_H    = 130;
const AVATAR_SIZE = 90;
const AVATAR_HALF = AVATAR_SIZE / 2;

const styles = StyleSheet.create({

  wrapper: { marginBottom: 16 },

  // ── Deep navy banner with decorative circles ──
  banner: {
    height: BANNER_H,
    backgroundColor: '#0d47a1',       // deep navy base
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: AVATAR_HALF + 8,
    paddingHorizontal: 20,
  },

  // Decorative translucent circles
  circle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60, right: -30,
  },
  circle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(21,101,192,0.5)',
    top: 10, right: 80,
  },
  circle3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 0, left: 40,
  },

  brandMark: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13, fontWeight: '700', letterSpacing: 1.5,
  },

  // ── White card below banner ──
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingTop: AVATAR_HALF + 12,    // space for overlapping avatar
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },

  // ── Avatar — positioned to overlap banner ──
  avatarRing: {
    position: 'absolute',
    top: -AVATAR_HALF,
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    alignSelf: 'center',
    shadowColor: '#0d47a1',
    shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#BBDEFB',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '900', color: '#0d47a1' },

  // Green online indicator
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#10B144',
    borderWidth: 2, borderColor: '#fff',
  },

  // ── Name + role ──
  nameRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name:     { fontSize: 20, fontWeight: '900', color: '#0d1b2a', letterSpacing: 0.3 },
  roleBadge:{
    backgroundColor: '#e3f2fd',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#1565C0', letterSpacing: 0.5 },

  email: { fontSize: 13, color: '#888', marginBottom: 20 },

  // ── Stats row ──
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginTop: 4,
    backgroundColor: '#f4f8ff',
    borderRadius: 16, paddingVertical: 14,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '900', color: '#0d47a1', marginBottom: 2 },
  statLabel:  { fontSize: 11, color: '#888', fontWeight: '600', letterSpacing: 0.3 },
  statDivider:{ width: 1, height: 32, backgroundColor: '#dde6f5' },
});

export default ProfileHeader;