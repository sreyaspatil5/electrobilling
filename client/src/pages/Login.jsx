import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, Alert, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, ElectricBolt, LockOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const Login = () => {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(isRegister ? registerSchema : loginSchema),
  });

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccessMsg('');
    reset();
  };

  const onSubmit = async (values) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(values.name, values.email, values.password);
        setSuccessMsg('Application submitted successfully! Please wait for superadmin approval.');
        setIsRegister(false);
        reset();
      } else {
        await login(values.email, values.password);
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      setError(err.displayMessage || (isRegister ? 'Registration failed.' : 'Login failed. Check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1e88e5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: 3,
                background: 'linear-gradient(135deg, #1565c0, #1e88e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
                boxShadow: '0 8px 20px rgba(21,101,192,0.35)',
              }}
            >
              <ElectricBolt sx={{ color: '#fff', fontSize: 34 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">ElectroBill</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {isRegister ? 'Apply for an admin account' : 'Sign in to your billing dashboard'}
            </Typography>
          </Box>

          {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isRegister && (
              <TextField
                {...register('name')}
                label="Full Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start">✉️</InputAdornment> }}
            />
            <TextField
              {...register('password')}
              label="Password"
              type={showPass ? 'text' : 'password'}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((s) => !s)} edge="end" size="small">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {isRegister && (
              <TextField
                {...register('confirmPassword')}
                label="Confirm Password"
                type={showPass ? 'text' : 'password'}
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((s) => !s)} edge="end" size="small">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1.4, fontSize: '1rem', borderRadius: 2 }}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Submit Application' : 'Sign In')}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{isRegister ? 'Already have an account?' : 'First time?'}</Typography>
          </Divider>
          
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={toggleMode}
            sx={{ py: 1.2, borderRadius: 2 }}
          >
            {isRegister ? 'Back to Login' : 'Apply for Admin Account'}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3, fontSize: '0.75rem' }}>
            Having issues? Contact hello@vops.digital
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
