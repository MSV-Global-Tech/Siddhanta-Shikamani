import React from 'react';
import { View, TextInput, TextInputProps, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  variant?: 'default' | 'floating';
  autoFocus?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  placeholder,
  variant = 'default',
  autoFocus = false,
  showCancel = false,
  onCancel,
  className,
  returnKeyType = 'search',
  ...props
}: SearchBarProps) {
  const haptics = useHapticFeedback();
  const [isFocused, setIsFocused] = React.useState(false);

  const handleClear = () => {
    haptics.light();
    onChangeText('');
    onClear?.();
  };

  const variantClasses = {
    default: clsx(
      'bg-white rounded-3xl border border-border-light shadow-soft',
      isFocused && 'border-primary-default shadow-elevated'
    ),
    floating: clsx(
      'bg-white rounded-3xl border border-border-light shadow-soft',
      isFocused && 'border-primary-default shadow-elevated'
    ),
  };

  return (
    <View className={clsx('flex flex-row items-center', className)}>
      <View className={clsx('flex-1 flex-row items-center px-4 py-3', variantClasses[variant])}>
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? '#8A3324' : '#A88C74'}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={() => {
            haptics.selection();
            onSubmit?.();
          }}
          placeholder={placeholder}
          placeholderTextColor="#A88C74"
          returnKeyType={returnKeyType}
          autoFocus={autoFocus}
          className="flex-1 font-kannada text-base-kan text-text-default leading-[22px] py-0"
          style={{
            paddingVertical: 0,
            textAlignVertical: 'center',
            includeFontPadding: false,
          }}
          {...props}
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <View className="w-7 h-7 rounded-full bg-border-light items-center justify-center">
              <Ionicons name="close" size={14} color="#7A5C48" />
            </View>
          </Pressable>
        )}
      </View>
      {showCancel && (
        <Pressable
          onPress={() => {
            haptics.light();
            onCancel?.();
          }}
          className="ml-3"
          hitSlop={8}
        >
          <Text className="font-kannada-medium text-base-kan text-primary-default">
            ರದ್ದು
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface SettingItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  borderTop?: boolean;
}

export function SettingItem({
  icon,
  title,
  description,
  rightContent,
  onPress,
  danger = false,
  borderTop = false,
}: SettingItemProps) {
  const haptics = useHapticFeedback();

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          haptics.light();
          onPress();
        }
      }}
      disabled={!onPress}
      className={clsx(
        'flex-row items-center px-5 py-4 bg-white rounded-3xl shadow-soft',
        borderTop && 'border-t border-border-light'
      )}
      style={({ pressed }) => ({
        backgroundColor: pressed && onPress ? '#FBF3E7' : '#FFFFFF',
      })}
    >
      {icon && (
        <View className={clsx(
          'w-10 h-10 rounded-xl items-center justify-center mr-4',
          danger ? 'bg-[#FBEAE7]' : 'bg-primary-subtle'
        )}>
          <Ionicons name={icon} size={20} color={danger ? '#C0392B' : '#8A3324'} />
        </View>
      )}
      <View className="flex-1 mr-3">
        <Text className={clsx(
          'text-[16px] leading-[22px]',
          danger ? 'text-error font-kannada-medium' : 'text-text-default font-kannada-medium'
        )}>
          {title}
        </Text>
        {description && (
          <Text className="text-[13px] leading-[18px] text-text-muted font-kannada mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {rightContent || (
        onPress && <Ionicons name="chevron-forward" size={18} color="#A88C74" />
      )}
    </Pressable>
  );
}

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingSwitch({ value, onValueChange, disabled = false }: SwitchProps) {
  const haptics = useHapticFeedback();

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          haptics.light();
          onValueChange(!value);
        }
      }}
      disabled={disabled}
      className={clsx(
        'w-13 h-8 rounded-full p-1 transition-all duration-200',
        value ? 'bg-primary-default' : 'bg-border-strong',
        disabled && 'opacity-50'
      )}
    >
      <View
        className={clsx(
          'w-6 h-6 rounded-full bg-white shadow-soft transition-transform duration-200',
          value ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </Pressable>
  );
}
