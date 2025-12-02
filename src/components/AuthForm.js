"use client";

import { useState } from 'react';

export default function AuthForm({ type = 'login', onSubmit, isLoading = false }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        acceptTerms: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation (signup only)
        if (type === 'signup' && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (type === 'signup' && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation (signup only)
        if (type === 'signup') {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }

            // Terms acceptance
            if (!formData.acceptTerms) {
                newErrors.acceptTerms = 'You must accept the terms and conditions';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (signup only) */}
            {type === 'signup' && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-white/10'
                            } bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors`}
                        placeholder="Enter your full name"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                </div>
            )}

            {/* Email field */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email Address *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-white/10'
                        } bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="Enter your email"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
            </div>

            {/* Password field */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Password *
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-white/10'
                            } bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors`}
                        placeholder={type === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
            </div>

            {/* Confirm Password field (signup only) */}
            {type === 'signup' && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                                } bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors`}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                </div>
            )}

            {/* Remember me checkbox (login only) */}
            {type === 'login' && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-slate-300">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                        Forgot password?
                    </a>
                </div>
            )}

            {/* Terms checkbox (signup only) */}
            {type === 'signup' && (
                <div>
                    <label className="flex items-start">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            className="mr-2 mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-slate-300">
                            I accept the{' '}
                            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                Terms and Conditions
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                Privacy Policy
                            </a>
                        </span>
                    </label>
                    {errors.acceptTerms && (
                        <p className="mt-1 text-sm text-red-400">{errors.acceptTerms}</p>
                    )}
                </div>
            )}

            {/* Submit button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    type === 'login' ? 'Sign In' : 'Create Account'
                )}
            </button>
        </form>
    );
}
