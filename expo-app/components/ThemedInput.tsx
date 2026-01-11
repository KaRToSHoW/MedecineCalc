import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from './ThemeContext';

type Props = TextInputProps & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
};

export default function ThemedInput({ leftIcon, rightIcon, style, containerStyle, ...props }: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.card,
          borderColor: focused ? theme.primary : theme.border,
          shadowColor: focused ? theme.primary : '#000'
        },
        containerStyle
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}

      <TextInput
        placeholderTextColor={theme.mutted}
        style={[styles.input, { color: theme.text }, style]}
        onFocus={e => {
          setFocused(true);
          if (props.onFocus) props.onFocus(e as any);
        }}
        onBlur={e => {
          setFocused(false);
          if (props.onBlur) props.onBlur(e as any);
        }}
        {...props}
      />

      {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  icon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0
  }
});
