import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'learner' });
    const [error, setError] = useState('');

    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                await register(formData.name, formData.email, formData.password, formData.role);
                if (formData.role === 'learner') {
                    navigate('/onboarding');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="page-shell flex items-center justify-center min-h-screen px-4">
            <div className="glass-panel w-full max-w-md p-8 m-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary-soft/20 flex items-center justify-center mb-4 text-primary-soft">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Smart LMS</h2>
                    <p className="text-sm text-slate-300">
                        {isLogin ? 'Welcome back, continue your journey.' : 'Let’s tailor your learning experience.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-md mb-6 text-sm text-center border border-red-500 border-opacity-30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    {!isLogin && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <label>Account Type</label>
                            <select
                                className="input-field"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="learner">Learner</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin (Testing Only)</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary-soft underline text-sm bg-transparent border-none cursor-pointer"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
