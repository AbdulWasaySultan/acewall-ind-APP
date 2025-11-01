// import React from 'react';
// import { Text, StyleSheet } from 'react-native';

// interface SimpleIconProps {
//   name: string;
//   size?: number;
//   color?: string;
//   style?: any;
// }

// const SimpleIcon: React.FC<SimpleIconProps> = ({ name, size = 24, color = '#000', style }) => {
//   const iconMap: { [key: string]: string } = {
//     'camera': '📷',
//     'chevron-back': '←',
//     'chevron-down': '↓',
//     'close': '✕',
//     'trash-outline': '🗑️',
//     'send': '📤',
//     'send-outline': '📤',
//     'person-circle-outline': '👤',
//     'close-circle': '❌',
//     'add': '+',
//     'remove': '-',
//     'edit': '✏️',
//     'save': '💾',
//     'delete': '🗑️',
//     'search': '🔍',
//     'menu': '☰',
//     'settings': '⚙️',
//     'home': '🏠',
//     'user': '👤',
//     'star': '⭐',
//     'star-outline': '☆',
//     'star-half': '⭐',
//     'heart': '❤️',
//     'like': '👍',
//     'dislike': '👎',
//     'share': '📤',
//     'download': '⬇️',
//     'upload': '⬆️',
//     'play': '▶️',
//     'pause': '⏸️',
//     'stop': '⏹️',
//     'next': '⏭️',
//     'previous': '⏮️',
//     'refresh': '🔄',
//     'loading': '⏳',
//     'warning': '⚠️',
//     'error': '❌',
//     'success': '✅',
//     'info': 'ℹ️',
//     'question': '❓',
//     'exclamation': '❗',
//     'check': '✓',
//     'cross': '✗',
//     'arrow-up': '↑',
//     'arrow-down': '↓',
//     'arrow-left': '←',
//     'arrow-right': '→',
//     'plus': '+',
//     'minus': '-',
//     'times': '×',
//     'divide': '÷',
//     'equals': '=',
//     'not-equals': '≠',
//     'greater-than': '>',
//     'less-than': '<',
//     'greater-than-or-equal': '≥',
//     'less-than-or-equal': '≤',
//     'infinity': '∞',
//     'pi': 'π',
//     'alpha': 'α',
//     'beta': 'β',
//     'gamma': 'γ',
//     'delta': 'δ',
//     'epsilon': 'ε',
//     'zeta': 'ζ',
//     'eta': 'η',
//     'theta': 'θ',
//     'iota': 'ι',
//     'kappa': 'κ',
//     'lambda': 'λ',
//     'mu': 'μ',
//     'nu': 'ν',
//     'xi': 'ξ',
//     'omicron': 'ο',
//     'rho': 'ρ',
//     'sigma': 'σ',
//     'tau': 'τ',
//     'upsilon': 'υ',
//     'phi': 'φ',
//     'chi': 'χ',
//     'psi': 'ψ',
//     'omega': 'ω',
//     'visibility': '👁',
//     'visibility-off': '🙈',
//     'fiber-manual-record': '●',
//     'person-circle-outline': '👤',
//     'close-circle': '❌',
//     'trash-outline': '🗑️',
//     'document-text': '📄',
//     'document-text-outline': '📄',
//     'open-outline': '🔗',
//     'chevron-forward': '→',
//     'check-circle': '✅',
//     'check-circle-outline': '⭕',
//     'play-circle-outline': '⭕',
//     'phone-portrait-outline': '📱',
//     'book-outline': '📖',
//     'pencil': '✏️',
//     'trash': '🗑️',
//     'document': '📄',
//     'link': '🔗',
//     'alert-circle': '⚠️',
//   };

//   const icon = iconMap[name] || '?';

//   return (
//     <Text style={[styles.icon, { fontSize: size, color }, style]}>
//       {icon}
//     </Text>
//   );
// };

// const styles = StyleSheet.create({
//   icon: {
//     textAlign: 'center',
//   },
// });

// export default SimpleIcon;
import React from 'react';
import { TextStyle, StyleProp } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// ✅ Only these imports provide glyph maps
const materialMap = (MaterialIcons as any).getRawGlyphMap?.() || {};
const evilMap = (EvilIcons as any).getRawGlyphMap?.() || {};
const fontawesomeMap = (FontAwesome as any).getRawGlyphMap?.() || {};

const SimpleIcon: React.FC<SimpleIconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  let IconComponent: any = null;
  console.log(name)
  if (materialMap[name]) IconComponent = MaterialIcons;
  else if (evilMap[name]) IconComponent = EvilIcons;
  else if (fontawesomeMap[name]) IconComponent = FontAwesome;

  if (IconComponent) {
    return <IconComponent name={name} size={size} color={color} style={style} />;
  }

  // fallback
  return (
    <MaterialIcons
      name="help-outline"
      size={size}
      color={color}
      style={style}
    />
  );
};

export default SimpleIcon;
