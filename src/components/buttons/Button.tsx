import React from 'react';
import { Pressable, PressableProps, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { AppText } from '../typography/AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: IconPosition;
  iconSize?: number;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  iconSize,
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  weight = 'semibold',
  onPress,
  style,
  ...props
}: ButtonProps) {
  const haptics = useHapticFeedback();

  const handlePress = (e: any) => {
    if (!disabled && !loading) {
      haptics.medium();
      onPress?.(e);
    }
  };

  const sizeClasses = {
    sm: {
      padding: 'px-4 py-2',
      gap: 'gap-1.5',
      radius: 'rounded-lg',
    },
    md: {
      padding: 'px-6 py-3.5',
      gap: 'gap-2',
      radius: 'rounded-xl',
    },
    lg: {
      padding: 'px-8 py-4.5',
      gap: 'gap-3',
      radius: 'rounded-2xl',
    },
  };

  const textVariant = size === 'sm' ? 'bodySmall' : size === 'md' ? 'body' : 'title';
  const defaultIconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 22;

  const variantContent = {
    primary: {
      container: 'bg-primary-default',
      text: 'inverted' as const,
      icon: '#FFFFFF',
    },
    secondary: {
      container: 'bg-white border border-secondary-default',
      text: 'secondary' as const,
      icon: '#B4832E',
    },
    outline: {
      container: 'bg-transparent border-2 border-primary-default',
      text: 'primary' as const,
      icon: '#8A3324',
    },
    ghost: {
      container: 'bg-primary-subtle',
      text: 'primary' as const,
      icon: '#8A3324',
    },
    gradient: {
      container: '',
      text: 'inverted' as const,
      icon: '#FFFFFF',
    },
  };

  const config = variantContent[variant];
  const sizeConfig = sizeClasses[size];
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#8A3324' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize || defaultIconSize} color={config.icon} />
          )}
          <AppText variant={textVariant} weight={weight} color={config.text}>
            {children}
          </AppText>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize || defaultIconSize} color={config.icon} />
          )}
        </>
      )}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={clsx(
        'flex flex-row items-center justify-center',
        sizeConfig.padding,
        sizeConfig.gap,
        sizeConfig.radius,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        variant !== 'gradient' && config.container,
        className
      )}
      style={({ pressed }) => {
        const baseStyle = {
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          opacity: pressed && !isDisabled ? 0.92 : 1,
        };
        if (typeof style === 'function') {
          return [baseStyle, style({ pressed, hovered: false })];
        }
        return [baseStyle, style];
      }}
      {...props}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={['#A0522D', '#7A2E22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={clsx(
            'absolute top-0 left-0 right-0 bottom-0',
            sizeConfig.radius
          )}
          style={{
            shadowColor: '#7A2E22',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        />
      ) : null}
      <View className={clsx('flex flex-row items-center justify-center', sizeConfig.gap, variant === 'gradient' && 'relative z-10')}>
        {content}
      </View>
    </Pressable>
  );
}

interface IconButtonProps extends PressableProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'filled' | 'outline';
  iconSize?: number;
  loading?: boolean;
  badge?: number;
  className?: string;
  color?: string;
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  iconSize,
  loading = false,
  badge,
  className,
  onPress,
  style,
  color,
  ...props
}: IconButtonProps) {
  const haptics = useHapticFeedback();

  const handlePress = (e: any) => {
    if (!loading) {
      haptics.light();
      onPress?.(e);
    }
  };

  const containerSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  const variantStyles = {
    default: {
      container: 'bg-transparent',
      icon: color || '#3D2314',
    },
    primary: {
      container: 'bg-primary-default',
      icon: color || '#FFFFFF',
    },
    secondary: {
      container: 'bg-secondary-default',
      icon: color || '#FFFFFF',
    },
    ghost: {
      container: 'bg-background-soft',
      icon: color || '#8A3324',
    },
    filled: {
      container: 'bg-primary-subtle',
      icon: color || '#8A3324',
    },
    outline: {
      container: 'bg-white border border-border-default',
      icon: color || '#3D2314',
    },
  };

  const config = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className={clsx(
        'items-center justify-center rounded-full',
        containerSizes[size],
        config.container,
        className
      )}
      style={({ pressed }) => {
        const baseStyle = {
          transform: [{ scale: pressed ? 0.94 : 1 }],
          opacity: pressed ? 0.85 : 1,
        };
        if (typeof style === 'function') {
          return [baseStyle, style({ pressed, hovered: false })];
        }
        return [baseStyle, style];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={config.icon} />
      ) : (
        <Ionicons name={icon} size={iconSize || iconSizes[size]} color={config.icon} />
      )}
      {badge !== undefined && badge > 0 && (
        <View
          className={clsx(
            'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error rounded-full items-center justify-center px-1'
          )}
        >
          <AppText variant="caption" weight="bold" color="inverted" align="center">
            {badge > 99 ? '99+' : badge.toString()}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
