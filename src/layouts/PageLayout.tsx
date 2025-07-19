import React from 'react';
import Box from '@mui/joy/Box';
import { useResponsive } from '../hooks/useResponsive';

interface PageLayoutProps extends React.PropsWithChildren {
  /**
   * Page variant determines spacing and layout
   * - default: Standard page padding for most content
   * - full: No padding, content fills entire area
   * - table: Optimized for data tables with appropriate spacing
   */
  variant?: 'default' | 'full' | 'table';
}

/**
 * Standard page layout component that provides consistent spacing and responsive behavior
 * Works seamlessly with the ResponsiveMenu component
 */
const PageLayout: React.FC<PageLayoutProps> = ({ children, variant = 'default' }) => {
  const { isMobile } = useResponsive();

  const getPadding = () => {
    switch (variant) {
      case 'full':
        return {};
      case 'table':
        return isMobile ? { p: 2 } : { p: 3 };
      case 'default':
      default:
        return isMobile ? { p: 2 } : { px: 3, py: 2 };
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        flex: 1,
        bgcolor: 'background.body',
        overflow: 'auto',
        // Account for mobile menu button on mobile
        pt: isMobile ? 7 : 0,
        ...getPadding(),
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
