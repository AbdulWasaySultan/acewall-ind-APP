// import React from "react";
// import { Text, StyleSheet } from "react-native";

// interface SimpleIconProps {
//   name: string;
//   size?: number;
//   color?: string;
//   style?: any;
// }

// const SimpleIcon: React.FC<SimpleIconProps> = ({
//   name,
//   size = 24,
//   color = "#000",
//   style,
// }) => {
//   const iconMap: { [key: string]: string } = {
//     'chat-bubble-outline': "",
//     chat: "💬",
//     clipboard: "📋",
//     description: "📄",
//     "account-circle": "👤",
//     "arrow-back": "←",
//     camera: "📷",
//     "chevron-back": "←",
//     "chevron-down": "↓",
//     close: "✕",
//     "trash-outline": "🗑️",
//     send: "📤",
//     "send-outline": "📤",
//     "person-circle-outline": "👤",
//     "close-circle": "❌",
//     add: "+",
//     remove: "-",
//     edit: "✏️",
//     save: "💾",
//     delete: "🗑️",
//     search: "🔍",
//     menu: "☰",
//     settings: "⚙️",
//     home: "🏠",
//     user: "👤",
//     star: "⭐",
//     "star-outline": "☆",
//     "star-half": "⭐",
//     heart: "❤️",
//     like: "👍",
//     dislike: "👎",
//     share: "📤",
//     download: "⬇️",
//     upload: "⬆️",
//     play: "▶️",
//     pause: "⏸️",
//     stop: "⏹️",
//     next: "⏭️",
//     previous: "⏮️",
//     refresh: "🔄",
//     loading: "⏳",
//     warning: "⚠️",
//     error: "❌",
//     success: "✅",
//     info: "ℹ️",
//     question: "❓",
//     exclamation: "❗",
//     check: "✓",
//     cross: "✗",
//     "arrow-up": "↑",
//     "arrow-down": "↓",
//     "arrow-left": "←",
//     "arrow-right": "→",
//     plus: "+",
//     minus: "-",
//     times: "×",
//     divide: "÷",
//     equals: "=",
//     "not-equals": "≠",
//     "greater-than": ">",
//     "less-than": "<",
//     "greater-than-or-equal": "≥",
//     "less-than-or-equal": "≤",
//     infinity: "∞",
//     pi: "π",
//     alpha: "α",
//     beta: "β",
//     gamma: "γ",
//     delta: "δ",
//     epsilon: "ε",
//     zeta: "ζ",
//     eta: "η",
//     theta: "θ",
//     iota: "ι",
//     kappa: "κ",
//     lambda: "λ",
//     mu: "μ",
//     nu: "ν",
//     xi: "ξ",
//     omicron: "ο",
//     rho: "ρ",
//     sigma: "σ",
//     tau: "τ",
//     upsilon: "υ",
//     phi: "φ",
//     chi: "χ",
//     psi: "ψ",
//     omega: "ω",
//     visibility: "👁",
//     "visibility-off": "🙈",
//     "fiber-manual-record": "●",
//     "document-text": "📄",
//     "document-text-outline": "📄",
//     "open-outline": "🔗",
//     "chevron-forward": "→",
//     "chevron-right": "→",
//     "check-circle": "✅",
//     "check-circle-outline": "⭕",
//     "play-circle-outline": "⭕",
//     "phone-portrait-outline": "📱",
//     "book-outline": "📖",
//     pencil: "✏️",
//     trash: "🗑️",
//     document: "📄",
//     link: "🔗",
//     "alert-circle": "⚠️",
//     "menu-book": "📚",
//     "clipboard-outline": "",
//     "file-based": "",
//     calendar: "📅",
//     school: "🏫",
//     book: "📘",
//     bell: "🔔",
//     video: "🎥",
//     "credit-card": "💳",
//   };

//   const icon = iconMap[name] || "?";

//   return (
//     <Text style={[styles.icon, { fontSize: size, color }, style]}>{icon}</Text>
//   );
// };

// const styles = StyleSheet.create({
//   icon: {
//     textAlign: "center",
//   },
// });

// export default SimpleIcon;

import React from "react";
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import {
  Layers,
  Wallet,
  Receipt,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  X,
  MessageSquare,
  ClipboardList,
  FileText,
  User,
  Camera,
  Trash2,
  Send,
  UserCircle,
  Plus,
  Minus,
  Pencil,
  Save,
  Search,
  Menu,
  Settings,
  Home,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RefreshCw,
  Loader,
  AlertTriangle,
  Info,
  HelpCircle,
  AlertOctagon,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Eye,
  EyeOff,
  Link,
  PlayCircle,
  Smartphone,
  BookOpen,
  Book,
  Calendar,
  School,
  Bell,
  Video,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Banknote,
  List,
  FileStack,
  CircleDot,
  ExternalLink,
  File,
  LucideProps,
} from "lucide-react-native";

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle | TextStyle>;
  /** Forces emoji rendering even if a Lucide icon with the same key exists */
  useEmoji?: boolean;
}

// 1. Lucide SVG Map
const lucideMap: Record<string, React.FC<LucideProps>> = {
  // === Wallet / Stats ===
  layers: Layers,
  "account-balance-wallet": Wallet,
  wallet: Wallet,
  receipt: Receipt,
  schedule: Clock,
  clock: Clock,
  cancel: XCircle,
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,

  // === Navigation / UI ===
  "arrow-back": ArrowLeft,
  "chevron-back": ChevronLeft,
  "chevron-down": ChevronDown,
  "chevron-forward": ChevronRight,
  "chevron-right": ChevronRight,
  close: X,
  "close-circle": XCircle,
  menu: Menu,
  search: Search,
  settings: Settings,
  home: Home,

  // === Communication ===
  chat: MessageSquare,
  "chat-bubble-outline": MessageSquare,
  send: Send,
  "send-outline": Send,
  share: Share2,
  bell: Bell,

  // === User ===
  "account-circle": UserCircle,
  "person-circle-outline": UserCircle,
  user: User,

  // === Content / Files ===
  clipboard: ClipboardList,
  "clipboard-outline": ClipboardList,
  description: FileText,
  "document-text": FileText,
  "document-text-outline": FileText,
  document: FileText,
  "file-based": FileStack,
  file: File,
  link: Link,
  "open-outline": Link,
  "open-in-new": ExternalLink,
  "external-link": ExternalLink,
  "menu-book": Book,
  book: BookOpen,
  "book-outline": BookOpen,
  calendar: Calendar,
  school: School,
  video: Video,

  // === Actions ===
  add: Plus,
  remove: Minus,
  edit: Pencil,
  pencil: Pencil,
  save: Save,
  delete: Trash2,
  trash: Trash2,
  "trash-outline": Trash2,
  download: Download,
  upload: Upload,
  camera: Camera,

  // === Media ===
  play: Play,
  pause: Pause,
  stop: Square,
  next: SkipForward,
  previous: SkipBack,
  "play-circle-outline": PlayCircle,

  // === Feedback ===
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  info: Info,
  question: HelpCircle,
  exclamation: AlertOctagon,
  check: Check,
  cross: X,

  // === Arrows ===
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  plus: Plus,
  minus: Minus,

  // === Misc ===
  star: Star,
  "star-outline": Star,
  "star-half": Star,
  heart: Heart,
  like: ThumbsUp,
  dislike: ThumbsDown,
  refresh: RefreshCw,
  loading: Loader,
  visibility: Eye,
  "visibility-off": EyeOff,
  "fiber-manual-record": CircleDot,
  "phone-portrait-outline": Smartphone,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  banknote: Banknote,
  list: List,
};

// 2. Emoji / Text Character Map
const emojiMap: Record<string, string> = {
  // === Emojis & Symbols ===
  chat: "💬",
  clipboard: "📋",
  description: "📄",
  "account-circle": "👤",
  "arrow-back": "←",
  camera: "📷",
  "chevron-back": "←",
  "chevron-down": "↓",
  close: "✕",
  "trash-outline": "🗑️",
  send: "📤",
  "send-outline": "📤",
  "person-circle-outline": "👤",
  "close-circle": "❌",
  add: "+",
  remove: "-",
  edit: "✏️",
  save: "💾",
  delete: "🗑️",
  search: "🔍",
  menu: "☰",
  settings: "⚙️",
  home: "🏠",
  user: "👤",
  star: "⭐",
  "star-outline": "☆",
  "star-half": "⭐",
  heart: "❤️",
  like: "👍",
  dislike: "👎",
  share: "📤",
  download: "⬇️",
  upload: "⬆️",
  play: "▶️",
  pause: "⏸️",
  stop: "⏹️",
  next: "⏭️",
  previous: "⏮️",
  refresh: "🔄",
  loading: "⏳",
  warning: "⚠️",
  error: "❌",
  success: "✅",
  info: "ℹ️",
  question: "❓",
  exclamation: "❗",
  check: "✓",
  cross: "✗",
  "arrow-up": "↑",
  "arrow-down": "↓",
  "arrow-left": "←",
  "arrow-right": "→",
  plus: "+",
  minus: "-",
  times: "×",
  divide: "÷",
  equals: "=",
  "not-equals": "≠",
  "greater-than": ">",
  "less-than": "<",
  "greater-than-or-equal": "≥",
  "less-than-or-equal": "≤",
  infinity: "∞",
  pi: "π",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  visibility: "👁",
  "visibility-off": "🙈",
  "fiber-manual-record": "●",
  "document-text": "📄",
  "document-text-outline": "📄",
  "open-outline": "🔗",
  "chevron-forward": "→",
  "chevron-right": "→",
  "check-circle": "✅",
  "check-circle-outline": "⭕",
  "play-circle-outline": "⭕",
  "phone-portrait-outline": "📱",
  "book-outline": "📖",
  pencil: "✏️",
  trash: "🗑️",
  document: "📄",
  link: "🔗",
  "alert-circle": "⚠️",
  "menu-book": "📚",
  calendar: "📅",
  school: "🏫",
  book: "📘",
  bell: "🔔",
  video: "🎥",
  "credit-card": "💳",
};

const SimpleIcon: React.FC<SimpleIconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
  useEmoji = false,
}) => {
  // 1. If explicit emoji request or Lucide component missing, check emoji map
  if (!useEmoji) {
    const LucideComponent = lucideMap[name];
    if (LucideComponent) {
      return (
        <LucideComponent
          size={size}
          color={color}
          style={style as StyleProp<ViewStyle>}
        />
      );
    }
  }

  // 2. Check Emoji Map
  const emoji = emojiMap[name];
  if (emoji) {
    return (
      <Text
        style={[
          styles.emoji,
          { fontSize: size, lineHeight: size * 1.2, color },
          style as StyleProp<TextStyle>,
        ]}
      >
        {emoji}
      </Text>
    );
  }

  // 3. Fallback for completely unknown icons
  return (
    <Text
      style={[
        styles.fallback,
        { fontSize: size, lineHeight: size * 1.2, color },
        style as StyleProp<TextStyle>,
      ]}
    >
      ?
    </Text>
  );
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: "center",
  },
  fallback: {
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default SimpleIcon;
