import * as React from 'react';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import Typography from '@mui/joy/Typography';

interface GeneralTableMobileProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  ariaLabel: string;
}

/**
 * GeneralTableMobile is a reusable list component optimized for mobile devices.
 * It renders a list of items with custom rendering logic and optional dividers.
 *
 * Props:
 * - items: Array of data objects to populate the list.
 * - renderItem: Function to render each item in the list.
 * - ariaLabel: Accessibility label for the list.
 */

const GeneralTableMobile: React.FC<GeneralTableMobileProps> = ({ items, renderItem, ariaLabel }) => {
  return (
    <Box>
      <List aria-label={ariaLabel}>
        {items.map((item, index) => (
          <React.Fragment key={index}> {/* Use index as key for simplicity */}
            <ListItem>{renderItem(item)}</ListItem>
            {index < items.length - 1 && <ListDivider />} {/* Add divider between items */}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default GeneralTableMobile;
