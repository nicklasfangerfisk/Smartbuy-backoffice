import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Unified responsive hook for consistent breakpoint management
 * across the SmartBack application
 */
export function useResponsive() {
  const theme = useTheme();
  
  // Use consistent 600px breakpoint across the app
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:1024px)');
  const isDesktop = useMediaQuery('(min-width:1025px)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    // Standardized breakpoints for easier usage
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
    // Breakpoint values for direct usage
    breakpoints: {
      mobile: '600px',
      tablet: '1024px',
      desktop: '1025px'
    },
    // Theme for advanced usage
    theme
  };
}

/**
 * Hook for responsive spacing values
 */
export function useResponsiveSpacing() {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    // Standard padding values
    containerPadding: isMobile ? 1 : isTablet ? 2 : 3,
    sectionPadding: isMobile ? 2 : isTablet ? 3 : 4,
    itemPadding: isMobile ? 1 : 2,
    
    // Gap values
    smallGap: isMobile ? 1 : 2,
    mediumGap: isMobile ? 2 : 3,
    largeGap: isMobile ? 3 : 4,
    
    // Margin values
    sectionMargin: isMobile ? 2 : 3,
    itemMargin: isMobile ? 1 : 2
  };
}

/**
 * Hook for responsive modal/dialog sizing
 */
export function useResponsiveModal() {
  const { isMobile } = useResponsive();
  
  const getModalSize = (size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium') => {
    if (isMobile) {
      return {
        width: '95vw',
        height: size === 'fullscreen' ? '95vh' : 'auto',
        maxHeight: '90vh',
        margin: 1
      };
    }
    
    const sizeMap = {
      small: { width: 400, maxWidth: '90vw' },
      medium: { width: 600, maxWidth: '90vw' },
      large: { width: 800, maxWidth: '90vw' },
      fullscreen: { width: '90vw', height: '90vh' }
    };
    
    return sizeMap[size];
  };
  
  return { getModalSize };
}

export default useResponsive;
