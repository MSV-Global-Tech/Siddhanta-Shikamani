import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../typography/AppText';
import { HStack, VStack } from '../layouts/Containers';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { router } from 'expo-router';
import { toKannadaNumerals } from '@/utils';
import { LOCAL_STRINGS } from '@/localization';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'gradient';
  subtitle?: string;
  scrollY?: number;
}

export function Header({
  title,
  showBack = false,
  onBack,
  rightContent,
  variant = 'default',
  subtitle,
  scrollY = 0,
}: HeaderProps) {
  const haptics = useHapticFeedback();

  const handleBack = () => {
    haptics.light();
    if (onBack) {
      onBack();
    } else {
      router.canGoBack() ? router.back() : router.push('/');
    }
  };

  const bgClass = {
    default: 'bg-background-soft',
    transparent: 'bg-transparent',
    gradient: '',
  };

  const scrolled = scrollY > 30;

  return (
    <View
      className={clsx(
        'px-6 py-4 border-b border-transparent',
        variant !== 'gradient' && bgClass[variant],
        variant === 'default' && scrolled && 'border-border-light shadow-soft z-50'
      )}
      style={[
        variant === 'gradient' && {
          backgroundColor: scrolled
            ? '#FFFFFF'
            : 'transparent',
        },
      ]}
    >
      <HStack justify="space-between" align="center">
        <View className="w-11 h-11 items-start justify-center">
          {showBack && (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              className="w-11 h-11 rounded-full items-center justify-center bg-background-soft"
            >
              <Ionicons name="arrow-back" size={20} color="#3D2314" />
            </Pressable>
          )}
        </View>
        <VStack spacing="xs" className="items-center flex-1 mx-3">
          <AppText
            variant={subtitle ? 'title' : 'heading3'}
            weight={subtitle ? 'semibold' : 'semibold'}
            align="center"
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color="muted" align="center">
              {subtitle}
            </AppText>
          )}
        </VStack>
        <View className="w-11 h-11 items-end justify-center">
          {rightContent}
        </View>
      </HStack>
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercent?: boolean;
  label?: string;
  color?: string;
  bgColor?: string;
  rounded?: boolean;
}

export function ProgressBar({
  progress,
  height = 'md',
  showLabel = false,
  showPercent = false,
  label,
  color,
  bgColor,
  rounded = true,
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View>
      {showLabel && (
        <HStack justify="space-between" className="mb-2">
          {label && (
            <AppText variant="caption" color="muted" weight="medium">
              {label}
            </AppText>
          )}
          {showPercent && (
            <AppText variant="caption" weight="semibold" color="primary">
              {toKannadaNumerals(clampedProgress)}%
            </AppText>
          )}
        </HStack>
      )}
      <View
        className={clsx(
          heightClasses[height],
          rounded && 'rounded-full',
          bgColor || 'bg-background-subtle'
        )}
      >
        <View
          className={clsx('h-full', rounded && 'rounded-full', color || 'bg-primary-default')}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
    </View>
  );
}

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function ProgressCircle({
  progress,
  size = 80,
  strokeWidth = 8,
  children,
}: ProgressCircleProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const innerSize = size - strokeWidth * 2;

  return (
    <View
      className="items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary-default"
      style={{ width: size, height: size, padding: strokeWidth / 2 }}
    >
      <View
        className="rounded-full bg-white items-center justify-center relative overflow-hidden"
        style={{ width: innerSize, height: innerSize }}
      >
        {clampedProgress > 0 && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-primary-subtle"
            style={{ height: `${clampedProgress}%` }}
          />
        )}
        <View className="relative z-10 items-center justify-center w-full h-full">
          {children || (
            <AppText variant="heading3" weight="bold" color="primary">
              {toKannadaNumerals(clampedProgress)}%
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 rounded-3xl bg-primary-subtle items-center justify-center mb-6">
        <Ionicons name={icon} size={40} color="#8A3324" />
      </View>
      <VStack spacing="sm" className="items-center mb-8 max-w-xs">
        <AppText variant="title" weight="semibold" align="center">
          {title}
        </AppText>
        {description && (
          <AppText variant="body" color="muted" align="center">
            {description}
          </AppText>
        )}
      </VStack>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-primary-default rounded-2xl px-8 py-3.5 shadow-floating"
        >
          <AppText variant="body" weight="semibold" color="inverted">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

interface VerseContentProps {
  verseNumber: number;
  sanskrit?: string;
  translation: string;
  commentary?: string;
  showSanskrit?: boolean;
  showTranslation?: boolean;
  showCommentary?: boolean;
  fontSize?: number;
}

export function VerseContent({
  verseNumber,
  sanskrit,
  translation,
  commentary,
  showSanskrit = true,
  showTranslation = true,
  showCommentary = true,
  fontSize = 20,
}: VerseContentProps) {
  const haptics = useHapticFeedback();

  return (
    <View className="animate-fade-in">
      <View className="items-center mb-2">
        <AppText variant="caption" weight="bold" className="text-secondary-dark tracking-widest">
          {LOCAL_STRINGS.verse} {toKannadaNumerals(verseNumber)}
        </AppText>
      </View>

      {showSanskrit && sanskrit && (
        <View className="bg-secondary-subtle/60 rounded-2xl px-5 py-3 mb-3 items-center">
          {sanskrit.split('\n').map((line, i) => (
            <AppText
              key={i}
              variant="verse"
              align="center"
              className="text-primary-dark font-serif-kan-bold"
              style={{
                fontSize: 20,
                lineHeight: 20 * 1.85,
              }}
            >
              {line}
            </AppText>
          ))}
        </View>
      )}

      {/* ಕನ್ನಡ ಭಾವಾರ್ಥ — ಶುದ್ಧ ಓದುಗ ಶೈಲಿ */}
      {showTranslation && (
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <View className="w-1 h-4 rounded-full bg-secondary-default mr-2.5" />
            <AppText variant="caption" weight="bold" className="text-secondary-dark tracking-wide">
              {LOCAL_STRINGS.kannadaBhavartha}
            </AppText>
          </View>
          <AppText
            variant="reading"
            className="text-text-default"
            style={{ fontSize: 20, lineHeight: 20 * 1.8 }}
          >
            {translation}
          </AppText>
        </View>
      )}



    </View>
  );
}
