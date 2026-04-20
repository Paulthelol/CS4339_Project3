import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import './styles.css';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const usingLogin = useState(true);
    const usingRegister = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [occupation, setOccupation] = useState('');
    const [registerLoginName, setRegisterLoginName] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const {
        mutateAsync: runLogin,
        isPending: isLoggingIn,
    } = useMutation({
        mutationKey: ['admin-login'],
        retry: false,
        mutationFn: async ({ login_name, password: loginPassword }) => {
            try {
                const res = await api.post('/admin/login', { login_name, password: loginPassword });
                return res.data;
            } catch (err) {
                throw new Error(err?.response?.data || 'Login failed');
            }
        },
    });

    const {
        mutateAsync: runRegister,
        isPending: isRegistering,
    } = useMutation({
        mutationKey: ['user-register'],
        retry: false,
        mutationFn: async (payload) => {
            try {
                const res = await api.post('/user', payload);
                return res.data;
            } catch (err) {
                throw new Error(err?.response?.data || 'Registration failed');
            }
        },
    });


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setUsernameError('');
        setPasswordError('');

        let hasValidationError = false;
        if (!username.trim()) {
            setUsernameError('Username is required.');
            hasValidationError = true;
        }
        if (!password) {
            setPasswordError('Password is required.');
            hasValidationError = true;
        }
        if (hasValidationError) {
            return;
        }

        try {
            const result = await runLogin({ login_name: username, password });
            console.log('Login successful:', result);
            queryClient.setQueryData(['admin-me'], result);
            await queryClient.invalidateQueries({ queryKey: ['admin-me'] });
            navigate('/');
        } catch (err) {
            setLoginError(err?.message || 'Login failed');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterSuccess('');

        try {
            await runRegister({
                first_name: firstName,
                last_name: lastName,
                location,
                description,
                occupation,
                login_name: registerLoginName,
                password: registerPassword,
            });

            setRegisterSuccess('Registration successful. Please log in.');
            usingRegister[1](false);
            usingLogin[1](true);
        } catch (err) {
            setRegisterError(err?.message || 'Registration failed');
        }
    };

    return (
        <div className="main-auth-page">
            {usingLogin[0] && (
            <div className="main-auth-card">
                {loginError && <p className="main-auth-error">{loginError}</p>}
                <Typography variant="h5">Login</Typography>
                <form className="main-auth-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleLoginSubmit(e);
                }}>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                    {usernameError && <p className="main-auth-error">{usernameError}</p>}
                    <label className="main-auth-field">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    {passwordError && <p className="main-auth-error">{passwordError}</p>}
                    <button type="submit" disabled={isLoggingIn}>{isLoggingIn ? 'Logging in...' : 'Login'}</button>
                </form>
                <button type="button" className="main-auth-toggle" onClick={() => {
                    usingLogin[1](false);
                    usingRegister[1](true);
                }}>Register</button>
            </div>
            )}

            {usingRegister[0] && (
            <div className="main-auth-card">
                {registerError && <p className="main-auth-error">{registerError}</p>}
                {registerSuccess && <p className="main-auth-success">{registerSuccess}</p>}
                <Typography variant="h5">Register New User</Typography>
                <form className="main-auth-form" onSubmit={handleRegisterSubmit}>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Occupation"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="text"
                            placeholder="Login Name"
                            value={registerLoginName}
                            onChange={(e) => setRegisterLoginName(e.target.value)}
                            required
                        />
                    </label>
                    <label className="main-auth-field">
                        <input
                            type="password"
                            placeholder="Password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" disabled={isRegistering}>{isRegistering ? 'Creating Account...' : 'Create Account'}</button>
                </form>
                <button type="button" className="main-auth-toggle" onClick={() => {
                    usingRegister[1](false);
                    usingLogin[1](true);
                }}>Back to Login</button>
            </div>
            )}
        </div>

    );
}

export default LoginRegister;