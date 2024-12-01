import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Register.css'

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate(); 

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    const passwordRegex = /^(?=.*\d)[A-Za-z\d]{6,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setNameError('');
        setEmailError('');
        setPasswordError('');

        let valid = true;

        // Check if the name is empty
        if (!name) {
            setNameError('Name is required.');
            valid = false;
        }

        // Check if the email is valid
        if (!email) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        }

        // Check if the password is valid
        if (!password) {
            setPasswordError('Password is required.');
            valid = false;
        } else if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 6 characters and contain at least one number.');
            valid = false;
        }

        if (!valid) {
            return;  
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password
            });
            console.log('Response:', response.data);
            
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            setErrorMessage('Registration failed: ' + (error.response?.data || error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form-container">
            <h2>Register</h2>
            
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
            />
            {nameError && <p style={{ color: 'red', fontSize: '14px' }}>{nameError}</p>}
            
            {/* Email Input */}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            {emailError && <p style={{ color: 'red', fontSize: '14px' }}>{emailError}</p>}
            
            {/* Password Input */}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {passwordError && <p style={{ color: 'red', fontSize: '14px' }}>{passwordError}</p>}
            
            <button type="submit">Register</button>
            
            {errorMessage && <p style={{ color: 'red', fontSize: '14px' }}>{errorMessage}</p>}
            
            <div>
                <p>
                    Already have an account? <a href="/login">Login here</a>
                </p>
                <p>
                    Don't have an account yet? <a href="/">Register here</a>
                </p>
            </div>
        </form>
    );
};

export default Register;
