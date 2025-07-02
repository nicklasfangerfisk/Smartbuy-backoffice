import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import fonts from '../theme/fonts';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Consistent page header component.
 * Provides standard typography and spacing for all page titles.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        flexShrink: 0, // Prevent header from shrinking
      }}
    >
      <Box>
        <Typography 
          level="h2" 
          sx={{ 
            fontSize: fonts.sizes.xlarge, 
            fontWeight: 'bold',
            mb: subtitle ? 1 : 0 
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            level="body-md" 
            sx={{ 
              color: 'text.secondary',
              fontSize: fonts.sizes.medium 
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {actions && (
        <Box sx={{ flexShrink: 0, ml: 2 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
