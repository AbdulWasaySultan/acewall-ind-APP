// PostAuthorRow.tsx
// Renders avatar, author name, role badge, and post date.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Author } from '.';
import Avatar from './Avatar';
import { capitalize, formatDate, getFullName } from './mnt/user-data/outputs/SpillTheTea/helpers';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';


interface PostAuthorRowProps {
  author:    Author;
  createdAt: string;
}

const PostAuthorRow: React.FC<PostAuthorRowProps> = ({ author, createdAt }) => (
  <View style={styles.row}>
    <Avatar uri={author?.profileImg?.url} />
    <View style={styles.info}>
      <Text style={styles.name}>
        {getFullName(author)}
        {author.role && (
          <Text style={styles.role}> {capitalize(author.role)}</Text>
        )}
      </Text>
      <Text style={styles.date}>{formatDate(createdAt)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  info: { marginLeft: 12, flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  role: { fontWeight: '400', color: COLORS.textMid },
  date: { fontSize: 12, color: COLORS.textFaint, marginTop: 2 },
});

export default PostAuthorRow;
