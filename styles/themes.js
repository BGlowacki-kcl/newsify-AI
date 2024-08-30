import { createTheme } from '@mui/material/styles';

let theme = createTheme(theme, {
    palette: {
      salmon: theme.palette.augmentColor({
        color: {
          main: '#2E073F',
        },
        name: 'salmon',
      }),
    },
  });