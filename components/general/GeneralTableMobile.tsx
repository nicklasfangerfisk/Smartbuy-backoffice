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

const GeneralTableMobile: React.FC<GeneralTableMobileProps> = ({ items, renderItem, ariaLabel }) => {
  return (
    <Box>
      <List aria-label={ariaLabel}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>{renderItem(item)}</ListItem>
            {index < items.length - 1 && <ListDivider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default GeneralTableMobile;
