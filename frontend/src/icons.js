// Central icon library for Bloom Haven
// All icons use Lucide React — consistent professional line icons

import {
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Receipt,
  Users,
  User,
  LogOut,
  Bell,
  BellOff,
  Menu,
  X,
  Wallet,
  Banknote,
  Bitcoin,
  CircleDollarSign,
  Diamond,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  ShieldCheck,
  KeyRound,
  Link,
  TrendingUp,
  TrendingDown,
  Info,
  Mail,
  Phone,
  Lock,
  MapPin,
  Settings,
  Crown,
  Snowflake,
  Ban,
  Plus,
  Home,
  ListOrdered,
  Hexagon,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Gift,
  UserPlus,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  ShoppingBag,
  Play,
  Gamepad2,
  Film,
} from 'lucide-react';

export {
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Receipt,
  Users,
  User,
  LogOut,
  Bell,
  BellOff,
  Menu,
  X,
  Wallet,
  Banknote,
  Bitcoin,
  CircleDollarSign,
  Diamond,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  ShieldCheck,
  KeyRound,
  Link,
  TrendingUp,
  TrendingDown,
  Info,
  Mail,
  Phone,
  Lock,
  MapPin,
  Settings,
  Crown,
  Snowflake,
  Ban,
  Plus,
  Home,
  ListOrdered,
  Hexagon,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Gift,
  UserPlus,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  ShoppingBag,
  Play,
  Gamepad2,
  Film,
};

// Crypto currency icon map
export const getCryptoIcon = (currency) => {
  switch (currency) {
    case 'BTC':
      return Bitcoin;
    case 'ETH':
      return Hexagon;
    case 'USDT':
      return CircleDollarSign;
    case 'BNB':
      return Diamond;
    case 'SOL':
      return Sparkles;
    case 'ADA':
      return CircleDollarSign;
    default:
      return Diamond;
  }
};

// Gift card icon map
export const getGiftcardIcon = (type) => {
  switch (type) {
    case 'Amazon':
      return ShoppingBag;
    case 'Apple':
      return ShoppingBag;
    case 'Google Play':
      return Play;
    case 'Steam':
      return Gamepad2;
    case 'Netflix':
      return Film;
    default:
      return Gift;
  }
};

// Transaction type icon map
export const getTransactionIcon = (type, depositType, withdrawType) => {
  if (type === 'deposit' || depositType) return ArrowDownToLine;
  if (type === 'withdraw' || withdrawType) return ArrowUpFromLine;
  if (type === 'swap') return ArrowLeftRight;
  if (type === 'referral') return Gift;
  if (type === 'kyc') return ShieldCheck;
  return Receipt;
};