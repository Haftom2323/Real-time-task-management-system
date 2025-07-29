import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import AuthForm from '../features/auth/AuthForm';
import { styled, keyframes } from '@mui/system';

// Animation for the background
const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const StyledPage = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  background: 'linear-gradient(-45deg, #4361ee, #3f37c9, #4cc9f0, #4895ef)',
  backgroundSize: '400% 400%',
  animation: `${gradient} 15s ease infinite`,
  padding: '1rem',
  paddingTop: '2rem',
});

const BrandContainer = styled(Box)({
  textAlign: 'center',
  marginBottom: '1rem',
  color: 'white',
  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginTop: '0.5rem',
});

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '500px !important',
  width: '100%',
  padding: 0,
});

const LoginRegisterPage: React.FC = () => {
  return (
    <StyledPage>
      <BrandContainer>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight={700}
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1.2,
            background: 'linear-gradient(90deg, #fff, #f8f9fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}
        >
          Real-Time Task Manager
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Streamline your workflow and boost productivity
        </Typography>
      </BrandContainer>
      
      <StyledContainer>
        <AuthForm />
      </StyledContainer>
      
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} Real-Time Task Manager. All rights reserved.
        </Typography>
      </Box>
    </StyledPage>
  );
};

export default LoginRegisterPage;