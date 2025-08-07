import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: 'admin', // default usrnme
        password: 'admin123' // default passwrd
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/dashboard');
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="w-full p-3 border border-gray-300 rounded mb-4"
                    required
                />

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded mb-4"
                    required
                />

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
