import React from 'react';
import Box from '@mui/joy/Box';
import { useResponsive, useResponsiveSpacing } from '../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'page' | 'dialog' | 'form' | 'card' | 'table-page';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullHeight?: boolean;
  className?: string;
}

/**
 * Responsive container component that applies consistent spacing
 * and layout patterns across mobile and desktop
 */
export function ResponsiveContainer({ 
  children, 
  variant = 'page',
  padding = 'medium',
  fullHeight = false,
  className
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();
  const spacing = useResponsiveSpacing();
  
  const getPadding = () => {
    if (padding === 'none') return 0;
    
    const paddingMap = {
      small: spacing.itemPadding,
      medium: spacing.containerPadding,
      large: spacing.sectionPadding
    };
    
    return paddingMap[padding] || spacing.containerPadding;
  };
  
  const getVariantStyles = () => {
    const baseStyles = {
      p: getPadding(),
      boxSizing: 'border-box' as const
    };
    
    switch (variant) {
      case 'page':
        return {
          ...baseStyles,
          height: fullHeight ? '100%' : 'auto',
          overflow: 'auto',
          width: '100%'
        };
      case 'dialog':
        return {
          ...baseStyles,
          height: 'auto',
          overflow: 'visible'
        };
      case 'form':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: spacing.mediumGap
        };
      case 'card':
        return {
          ...baseStyles,
          borderRadius: 1,
          bgcolor: 'background.surface'
        };
      case 'table-page':
        return {
          width: '100%',
          overflow: 'visible',
          // Simple, consistent padding for desktop table pages
          pt: isMobile ? 1 : 2,  // 16px top
          pl: isMobile ? 1 : 2,  // 16px left  
          pr: isMobile ? 1 : 2,  // 16px right
          pb: isMobile ? 1 : 2,  // 16px bottom
          boxSizing: 'border-box' as const
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <Box sx={getVariantStyles()} className={className}>
      {children}
    </Box>
  );
}

export default ResponsiveContainer;
