import React from 'react'
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import Theme from "@/components/theme-changer";
import axios from 'axios';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

const login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Email validation state
    const [emailValidation, setEmailValidation] = useState({
        isValid: false,
        errorMessage: ''
    });

    // Password validation states
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false,
        isValid: false
    });

    const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
    const [showEmailValidation, setShowEmailValidation] = useState(false);

    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [hovered, setHovered] = useState(false);
    const { data: sessionData, status } = useSession();
    const [InvalidCredentials, setInvalidCredentials] = useState(false);
    const [error, setError] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (error) {
            setErrorMsg(error);
        }
    }, [errorMsg]);

    // Validate email on change
    useEffect(() => {
        const email = formData.email;
        
        // Basic email regex pattern
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        let isValid = false;
        let errorMessage = '';
        
        if (!email) {
            errorMessage = 'Email is required';
        } else if (!emailRegex.test(email)) {
            errorMessage = 'Please enter a valid email address';
        } else {
            isValid = true;
        }
        
        setEmailValidation({
            isValid,
            errorMessage
        });
    }, [formData.email]);

    // Validate password on change
    useEffect(() => {
        const password = formData.password;
        const validations = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };
        
        const isValid = Object.values(validations).every(Boolean);
        
        setPasswordValidation({
            ...validations,
            isValid
        });
    }, [formData.password]);

    if (!mounted) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Check both email and password validations
        if (!emailValidation.isValid) {
            setErrorMsg(emailValidation.errorMessage || "Please enter a valid email");
            return;
        }
        
        if (formData.password && !passwordValidation.isValid) {
            setErrorMsg("Password must meet all security requirements");
            return;
        }
        
        try {
            const res = await axios.post('/api/login', formData);
            if (res.status === 200) {
                setInvalidCredentials(false);
                await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });
                router.push('/');
            } else if (res.status === 401) {
                setErrorMsg("Invalid credentials");
                setInvalidCredentials(true);
            }
        }
        catch (error) {
            console.error("Login error:", error.response?.data?.error || error.message)
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    // Validation icon indicator helper
    const ValidationIcon = ({ isValid }) => (
        <span className={`mr-2 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
            {isValid ? '✓' : '✗'}
        </span>
    );

    return (
        <div>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="h-[100vh] flex flex-col lg:flex-row overflow-hidden items-center justify-center bg-black w-full gap-4 mx-auto px-8 relative"
            >
                <div onMouseEnter={() => { setHovered(false) }} onMouseLeave={() => { setHovered(true) }} className="z-20 flex items-center justify-center bg-black dark:bg-black">
                    <div className="max-w-md w-full bg-zinc-300 dark:bg-zinc-800 p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white text-center mb-6">
                            Log In
                        </h1>
                        <form className="space-y-4 z-50" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="relative">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setShowEmailValidation(true)}
                                    onBlur={() => setTimeout(() => setShowEmailValidation(false), 200)}
                                    placeholder='Enter your email'
                                    required
                                    className={`mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${
                                        formData.email && !emailValidation.isValid
                                            ? 'border-red-500 dark:border-red-500'
                                            : formData.email && emailValidation.isValid
                                            ? 'border-green-500 dark:border-green-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                                />
                                
                                {/* Email validation message */}
                                {showEmailValidation && formData.email && !emailValidation.isValid && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                                        <ValidationIcon isValid={false} />
                                        {emailValidation.errorMessage}
                                    </div>
                                )}
                                
                                {/* Email valid indicator */}
                                {formData.email && emailValidation.isValid && (
                                    <div className="absolute right-3 top-9">
                                        <span className="text-green-500 text-lg">✓</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Password Field */}
                            <div className="relative">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder='Enter your password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setShowPasswordCriteria(true)}
                                    onBlur={() => setTimeout(() => setShowPasswordCriteria(false), 200)}
                                    className={`mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${
                                        formData.password && !passwordValidation.isValid
                                            ? 'border-red-500 dark:border-red-500'
                                            : formData.password && passwordValidation.isValid
                                            ? 'border-green-500 dark:border-green-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                                />
                                
                                {/* Password valid indicator */}
                                {formData.password && passwordValidation.isValid && (
                                    <div className="absolute right-3 top-9">
                                        <span className="text-green-500 text-lg">✓</span>
                                    </div>
                                )}
                                
                                {/* Password validation criteria */}
                                {showPasswordCriteria && formData.password && (
                                    <div className="mt-2 p-3 bg-white dark:bg-zinc-700 rounded-md text-sm shadow-md">
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Password must have:</h3>
                                        <ul className="space-y-1">
                                            <li className={passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                <ValidationIcon isValid={passwordValidation.minLength} />
                                                At least 8 characters
                                            </li>
                                            <li className={passwordValidation.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                                                At least one uppercase letter
                                            </li>
                                            <li className={passwordValidation.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                <ValidationIcon isValid={passwordValidation.hasLowerCase} />
                                                At least one lowercase letter
                                            </li>
                                            <li className={passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                <ValidationIcon isValid={passwordValidation.hasNumber} />
                                                At least one number
                                            </li>
                                            <li className={passwordValidation.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                <ValidationIcon isValid={passwordValidation.hasSpecial} />
                                                At least one special character (@, #, $, %, etc.)
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            {/* Error Message */}
                            {errorMsg && (
                                <div className='text-red-700 dark:text-red-400 text-sm font-medium p-2 bg-red-100 dark:bg-red-900/30 rounded-md'>
                                    {errorMsg}
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`w-full py-2 px-4 font-medium rounded-lg duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                                    (!emailValidation.isValid && formData.email) || 
                                    (formData.password && !passwordValidation.isValid)
                                    ? 'bg-zinc-400 dark:bg-zinc-600 text-zinc-200 cursor-not-allowed'
                                    : 'bg-zinc-700 text-white hover:bg-zinc-900 hover:text-white dark:bg-zinc-700 dark:hover:bg-zinc-400 dark:hover:text-black'
                                }`}
                                disabled={(!emailValidation.isValid && formData.email) || (formData.password && !passwordValidation.isValid)}
                            >
                                Log In
                            </button>

                            <Link href={"/register"} className='flex justify-center text-sm text-blue-700 border-blue-700 border rounded-full hover:text-blue-500 duration-500'>
                                Sign-up?
                            </Link>
                        </form>
                    </div>
                </div>

                <Theme />

                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full absolute inset-0"
                        >
                            <CanvasRevealEffect
                                animationSpeed={5}
                                containerClassName="bg-transparent"
                                colors={[
                                    [59, 130, 246],
                                    [139, 92, 246],
                                ]}
                                opacities={[0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1]}
                                dotSize={2}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Radial gradient for the cute fade */}
                <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" />
            </div>
        </div>
    )
}

export default login