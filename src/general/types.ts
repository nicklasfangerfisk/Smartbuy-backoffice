import { ColorPaletteProp } from '@mui/joy/styles';

// Defines a type for ticket status colors, restricting values to specific color palette options.
// This is used to ensure consistent styling for ticket statuses across the application.
export type TicketStatusColor = Extract<ColorPaletteProp, 'success' | 'warning' | 'neutral'>;
