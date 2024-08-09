import React, { useState } from 'react';
import axios from 'axios';
import styles from './Signup.css';

function Signup() {
    const [formData, setFormData] = useState({
        userType: 'student',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ error: '', success: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage({ ...message, error: 'Passwords do not match' });
            return;
        }
        try {
            const response = await axios.post('/api/v1/user/signup', formData);
            setMessage({ error: '', success: 'User created successfully. Please login.' });
            // Redirect or further actions
        } catch (error) {
            setMessage({ error: error.response.data, success: '' });
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className="row">
                    <div className={`col-md-6 ${styles.sideImage}`}>
                        <div className={styles.logo}><a href="/"><img src="../assets/logo.webp" alt="logo" /></a></div>
                        <div className={styles.girl}><img src="../assets/girl.webp" alt="girl" /></div>
                        <div className={styles.text}><p>Join us today at UCMAS!</p></div>
                    </div>
                    <div className="col-md-6">
                        <form className={styles.inputBox} onSubmit={handleSubmit}>
                            <header>Sign Up</header>
                            {message.error && <div className="alert alert-danger">{message.error}</div>}
                            {message.success && <div className="alert alert-success">{message.success}</div>}
                            <div className={styles.userTypeSelection}>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="userType" value="student" checked={formData.userType === 'student'} onChange={handleChange} />
                                    <label>Student</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="userType" value="teacher" checked={formData.userType === 'teacher'} onChange={handleChange} />
                                    <label>Teacher</label>
                                </div>
                            </div>
                            <div className={styles.inputField}>
                                <input type="text" className={styles.input} name="firstName" required autoComplete="off" value={formData.firstName} onChange={handleChange} />
                                <label>First Name</label>
                            </div>
                            <div className={styles.inputField}>
                                <input type="text" className={styles.input} name="lastName" required autoComplete="off" value={formData.lastName} onChange={handleChange} />
                                <label>Last Name</label>
                            </div>
                            <div className={styles.inputField}>
                                <input type="email" className={styles.input} name="email" required autoComplete="off" value={formData.email} onChange={handleChange} />
                                <label>Email</label>
                            </div>
                            <div className={styles.inputField}>
                                <input type="password" className={styles.input} name="password" required autoComplete="off" value={formData.password} onChange={handleChange} />
                                <label>Password</label>
                            </div>
                            <div className={styles.inputField}>
                                <input type="password" className={styles.input} name="confirmPassword" required autoComplete="off" value={formData.confirmPassword} onChange={handleChange} />
                                <label>Confirm Password</label>
                            </div>
                            <div className={styles.inputGroup}>
                                <button type="submit" className="btn btn-primary">Sign Up</button>
                            </div>
                            <div className={styles.signin}>
                                <span>Already have an account? <a href="/api/v1/user/login">Sign In Here</a></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;