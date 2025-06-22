import { ColorPaletteProp } from '@mui/joy/styles';

export type TicketStatusColor = Extract<ColorPaletteProp, 'success' | 'warning' | 'neutral'>;
