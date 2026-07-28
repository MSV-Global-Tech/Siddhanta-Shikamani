import React from 'react';
import { View, ViewProps, Pressable, PressableProps, ScrollView, ScrollViewProps } from 'react-native';
import { clsx } from 'clsx';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppText } from '../typography/AppText';

interface ScreenContainerProps extends SafeAreaViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  backgroundColor?: string;
  showStatusBar?: boolean;
}

export function ScreenContainer({
  children,
  edges = ['top'],
  scroll = false,
  scrollProps,
  className,
  showStatusBar = true,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      className={clsx('flex-1 bg-background-default', className)}
      edges={edges}
      style={style}
      {...props}
    >
      {showStatusBar && <StatusBar style="dark" />}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

interface SectionProps extends ViewProps {
  children: React.ReactNode;
  title?: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  paddingHorizontal?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Section({
  children,
  title,
  showSeeAll = false,
  onSeeAll,
  paddingHorizontal = 'md',
  className,
  ...props
}: SectionProps) {
  const paddingClasses = {
    sm: 'px-3',
    md: 'px-6',
    lg: 'px-8',
  };

  return (
    <View className={clsx('mb-7', className)} {...props}>
      {title && (
        <View className={clsx('flex-row items-center justify-between mb-4', paddingClasses[paddingHorizontal])}>
          <AppText variant="title" weight="semibold">
            {title}
          </AppText>
          {showSeeAll && (
            <Pressable onPress={onSeeAll} hitSlop={8}>
              <AppText variant="bodySmall" color="primary" weight="semibold">
                ನೋಡಿ →
              </AppText>
            </Pressable>
          )}
        </View>
      )}
      {title ? (
        <View className={paddingClasses[paddingHorizontal]}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
}

interface CardProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'outline';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  radius = 'xl',
  className,
  style,
  ...props
}: CardProps) {
  const variantClasses = {
    elevated: 'bg-white shadow-elevated border border-background-soft',
    flat: 'bg-background-default',
    outline: 'bg-white border border-border-default',
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    none: 'p-0',
  };

  const radiusClasses = {
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
  };

  const elevatedStyle = variant === 'elevated'
    ? {
        shadowColor: '#3D2314',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
      }
    : undefined;

  return (
    <Pressable
      className={clsx(
        variantClasses[variant],
        paddingClasses[padding],
        radiusClasses[radius],
        className
      )}
      style={[elevatedStyle, style] as any}
      {...props}
    >
      {children}
    </Pressable>
  );
}

interface VStackProps extends ViewProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  className?: string;
}

export function VStack({
  children,
  spacing = 'md',
  align = 'stretch',
  justify = 'flex-start',
  className,
  style,
  ...props
}: VStackProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    'flex-start': 'items-start',
    center: 'items-center',
    'flex-end': 'items-end',
    stretch: '',
  };

  const justifyClasses = {
    'flex-start': '',
    center: 'justify-center',
    'flex-end': 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
  };

  return (
    <View
      className={clsx(
        'flex flex-col',
        gapClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

interface HStackProps extends ViewProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  className?: string;
}

export function HStack({
  children,
  spacing = 'md',
  align = 'center',
  justify = 'flex-start',
  className,
  style,
  ...props
}: HStackProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    'flex-start': 'items-start',
    center: 'items-center',
    'flex-end': 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    'flex-start': '',
    center: 'justify-center',
    'flex-end': 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
  };

  return (
    <View
      className={clsx(
        'flex flex-row',
        gapClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'normal';
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 'thin',
  className,
  ...props
}: DividerProps) {
  const thicknessClass = thickness === 'thin' ? 'bg-border-light' : 'bg-border-default';
  const sizeClass =
    orientation === 'horizontal'
      ? thickness === 'thin'
        ? 'h-px w-full'
        : 'h-0.5 w-full'
      : thickness === 'thin'
      ? 'w-px h-full'
      : 'w-0.5 h-full';

  return <View className={clsx(thicknessClass, sizeClass, className)} {...props} />;
}

interface SpacerProps extends ViewProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'flex';
  className?: string;
}

export function Spacer({ size = 'md', className, ...props }: SpacerProps) {
  const sizeClasses = {
    xs: 'h-1 w-1',
    sm: 'h-2 w-2',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-12 w-12',
    flex: 'flex-1',
  };

  return <View className={clsx(sizeClasses[size], className)} {...props} />;
}
