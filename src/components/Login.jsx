import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        setEmailError('');
        setPasswordError('');
        setErrorMessage('');

        // Validate form fields
        let isValid = true;
        if (!email) {
            setEmailError('Email is required.');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Password is required.');
            isValid = false;
        }

        if (!isValid) return; 

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            console.log(res.data);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
               
                setErrorMessage(err.response.data.message || 'Login failed. Please try again.');
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit}>
                
                <h2>Login</h2>

               
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {emailError && <p style={{ color: 'red', fontSize: '14px' }}>{emailError}</p>}

               
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {passwordError && <p style={{ color: 'red', fontSize: '14px' }}>{passwordError}</p>}

                <button type="submit">Login</button>

                
                {errorMessage && <p style={{ color: 'red', fontSize: '14px' }}>{errorMessage}</p>}

                <div className="auth-links">
                <p>
                    Don't have an account? <a href="/">Register here</a>
                </p>
                <p>
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
            </form>

           
            
        </div>
    );
};

export default Login;
