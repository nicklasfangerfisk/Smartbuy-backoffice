import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import fonts from '../theme/fonts';

interface TablePageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Standardized header component for desktop table pages.
 * Provides consistent typography, spacing, and layout for all table views.
 */
export const TablePageHeader: React.FC<TablePageHeaderProps> = ({ 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 2, // Consistent 16px margin bottom
        flexShrink: 0,
      }}
    >
      <Box>
        <Typography 
          level="h2" 
          sx={{ 
            fontSize: fonts.sizes.xlarge, // Consistent 1.5rem font size
            fontWeight: 'bold',
            mb: subtitle ? 1 : 0,
            lineHeight: 1.2, // Consistent line height
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            level="body-md" 
            sx={{ 
              color: 'text.secondary',
              fontSize: fonts.sizes.medium,
              lineHeight: 1.4,
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

export default TablePageHeader;
