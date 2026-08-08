import { Text, TextProps } from 'react-native';
import { clsx } from 'clsx';
import { useAppStore } from '@/store/useAppStore';

type TextVariant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'title'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'verse'
  | 'reading';

type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'primary-dark' | 'secondary' | 'secondary-dark' | 'inverted' | 'error' | 'warning' | 'success';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  className?: string;
}

const variantStyles: Record<TextVariant, { size: string; leading: string; tracking: string }> = {
  display: { size: 'text-4xl-kan', leading: 'leading-[44px]', tracking: 'tracking-tight' },
  heading1: { size: 'text-3xl-kan', leading: 'leading-[38px]', tracking: 'tracking-tight' },
  heading2: { size: 'text-2xl-kan', leading: 'leading-[32px]', tracking: 'tracking-tight' },
  heading3: { size: 'text-xl-kan', leading: 'leading-[28px]', tracking: 'tracking-normal' },
  title: { size: 'text-lg-kan', leading: 'leading-[24px]', tracking: 'tracking-normal' },
  subtitle: { size: 'text-base-kan', leading: 'leading-[22px]', tracking: 'tracking-wide' },
  bodyLarge: { size: 'text-base-kan', leading: 'leading-[24px]', tracking: 'tracking-normal' },
  body: { size: 'text-sm-kan', leading: 'leading-[20px]', tracking: 'tracking-normal' },
  bodySmall: { size: 'text-xs-kan', leading: 'leading-[18px]', tracking: 'tracking-normal' },
  caption: { size: 'text-xs-kan', leading: 'leading-[16px]', tracking: 'tracking-wide' },
  overline: { size: 'text-xs-kan', leading: 'leading-[16px]', tracking: 'tracking-wider' },
  verse: { size: 'text-lg-kan', leading: 'leading-[32px]', tracking: 'tracking-wide' },
  reading: { size: 'text-lg-kan', leading: 'leading-[34px]', tracking: 'tracking-normal' },
};

const weightFonts: Record<TextWeight, { sans: string; serif: string }> = {
  light: { sans: 'font-kannada', serif: 'font-serif-kan' },
  regular: { sans: 'font-kannada', serif: 'font-serif-kan' },
  medium: { sans: 'font-kannada-medium', serif: 'font-serif-kan-bold' },
  semibold: { sans: 'font-kannada-semi', serif: 'font-serif-kan-bold' },
  bold: { sans: 'font-kannada-bold', serif: 'font-serif-kan-bold' },
};

const colorClasses: Record<string, string> = {
  default: 'text-text-default',
  muted: 'text-text-muted',
  subtle: 'text-text-subtle',
  primary: 'text-primary-default',
  'primary-dark': 'text-primary-dark',
  secondary: 'text-secondary-default',
  'secondary-dark': 'text-secondary-dark',
  inverted: 'text-white',
  error: 'text-error',
  warning: 'text-warning',
  success: 'text-success',
};

const alignClasses: Record<string, string> = {
  auto: '',
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
  justify: '',
};

export function AppText({
  variant = 'body',
  weight = 'regular',
  color = 'default',
  align = 'auto',
  numberOfLines,
  className,
  style,
  children,
  ...props
}: AppTextProps) {
  const fontFamilySetting = useAppStore((state) => state.settings.fontFamily);
  const fontSizeBoost = variant === 'reading' || variant === 'verse' ? 0 : 0;

  const variantConfig = variantStyles[variant];
  const weightConfig = weightFonts[weight];
  const fontClass = weightConfig[fontFamilySetting];

  return (
    <Text
      className={clsx(
        variantConfig.size,
        variantConfig.leading,
        variantConfig.tracking,
        fontClass,
        colorClasses[color],
        alignClasses[align],
        className
      )}
      numberOfLines={numberOfLines}
      style={[
        align === 'justify' && { textAlign: 'justify' as const },
        fontSizeBoost > 0 && { fontSize: (parseInt(variantConfig.size) || 16) + fontSizeBoost },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
