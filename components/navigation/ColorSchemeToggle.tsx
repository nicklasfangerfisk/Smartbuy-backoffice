import * as React from 'react';
import { useColorScheme } from '@mui/joy/styles';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';

import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightMode';

/**
 * A toggle button for switching between light and dark color schemes.
 *
 * @param {IconButtonProps} props - Props passed to the underlying IconButton component.
 * @returns {JSX.Element} The rendered toggle button.
 *
 * The button uses Material-UI's Joy UI library to manage the color scheme.
 * It displays a dark mode icon when in light mode and a light mode icon when in dark mode.
 */
export default function ColorSchemeToggle(props: IconButtonProps) {
  const { onClick, sx, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure the component is only rendered after the initial mount.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a disabled button while the component is mounting.
    return (
      <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        {...other}
        sx={sx}
        disabled
      />
    );
  }

  return (
    <IconButton
      data-screenshot="toggle-mode"
      size="sm"
      variant="outlined"
      color="neutral"
      {...other}
      onClick={(event) => {
        // Toggle between light and dark modes.
        if (mode === 'light') {
          setMode('dark');
        } else {
          setMode('light');
        }
        // Call the onClick handler if provided.
        onClick?.(event);
      }}
      sx={[
        // Conditionally render icons based on the current mode.
        mode === 'dark'
          ? { '& > *:first-of-type': { display: 'none' } }
          : { '& > *:first-of-type': { display: 'initial' } },
        mode === 'light'
          ? { '& > *:last-of-type': { display: 'none' } }
          : { '& > *:last-of-type': { display: 'initial' } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <DarkModeRoundedIcon />
      <LightModeIcon />
    </IconButton>
  );
}
