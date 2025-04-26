'use client';

import { signIn } from 'next-auth/react';
import { Button, Container, Typography, Box } from '@mui/material';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

export default function SignIn() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Вход в One Photo
        </Typography>
        <Button
          variant="contained"
          startIcon={<MicrosoftIcon />}
          onClick={() => signIn('azure-ad')}
          sx={{ mt: 3, mb: 2 }}
        >
          Войти через Microsoft
        </Button>
      </Box>
    </Container>
  );
} 