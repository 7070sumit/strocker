import React from 'react'
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import Theme from "@/components/theme-changer";
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

const register = () => {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false
  });
  
  const [emailValidation, setEmailValidation] = useState({
    isFormatValid: false,
    isValid: false
  });
  
  // Track if fields have been touched
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password validation effect
  useEffect(() => {
    const password = formData.password;
    
    const validations = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    const isValid = Object.values(validations).every(Boolean);
    
    setPasswordValidation({
      ...validations,
      isValid
    });
  }, [formData.password]);

  // Email validation effect
  useEffect(() => {
    const email = formData.email;
    
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isFormatValid = emailRegex.test(email);
    
    setEmailValidation({
      isFormatValid,
      isValid: isFormatValid
    });
  }, [formData.email]);

  if (!mounted) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (e.target.name === 'password' && !passwordTouched) {
      setPasswordTouched(true);
    }
    
    if (e.target.name === 'email' && !emailTouched) {
      setEmailTouched(true);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Mark both fields as touched to show validation errors
    setEmailTouched(true);
    setPasswordTouched(true);
    
    // Prevent form submission if either validation fails
    if (!passwordValidation.isValid || !emailValidation.isValid) {
      return;
    }
    
    try {
      const res = await axios.post('/api/register', formData);
      if (res.status === 201) {
        router.push('/login');
      }
    }
    catch(error) {
      console.error("Registration error:", error.response?.data?.error || error.message);
    }
  };

  // Render validation status indicator
  const ValidationIndicator = ({ isValid, text }) => (
    <div className="flex items-center">
      <span className={`mr-2 text-sm ${isValid ? 'text-green-500' : 'text-red-500'}`}>
        {isValid ? '✓' : '✗'}
      </span>
      <span className={`text-xs ${isValid ? 'text-green-500' : 'text-red-500'}`}>
        {text}
      </span>
    </div>
  );

  // Form is valid when both email and password are valid
  const isFormValid = emailValidation.isValid && passwordValidation.isValid;

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="h-[100vh] flex flex-col lg:flex-row overflow-hidden items-center justify-center bg-black w-full gap-4 mx-auto px-8 relative"
      >
        <div onMouseEnter={() => setHovered(false)} onMouseLeave={() => setHovered(true)} className="z-20 flex items-center justify-center bg-black dark:bg-black">
          <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white text-center mb-6">
              Sign Up
            </h1>
            <form className="space-y-4 z-50" method='POST' onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name='email'
                  placeholder='Enter your email'
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${
                    emailTouched && !emailValidation.isValid 
                      ? 'border-red-500 dark:border-red-500' 
                      : emailValidation.isValid && emailTouched
                        ? 'border-green-500 dark:border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                />
                {emailTouched && !emailValidation.isValid && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid email address
                  </p>
                )}
              </div>
              
              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name='password'
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${
                    passwordTouched && !passwordValidation.isValid 
                      ? 'border-red-500 dark:border-red-500' 
                      : passwordValidation.isValid && passwordTouched
                        ? 'border-green-500 dark:border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                />
              </div>
              
              {/* Password validation feedback */}
              {passwordTouched && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Requirements:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <ValidationIndicator 
                      isValid={passwordValidation.minLength} 
                      text="At least 8 characters" 
                    />
                    <ValidationIndicator 
                      isValid={passwordValidation.hasUppercase} 
                      text="At least one uppercase letter" 
                    />
                    <ValidationIndicator 
                      isValid={passwordValidation.hasLowercase} 
                      text="At least one lowercase letter" 
                    />
                    <ValidationIndicator 
                      isValid={passwordValidation.hasNumber} 
                      text="At least one number" 
                    />
                    <ValidationIndicator 
                      isValid={passwordValidation.hasSpecial} 
                      text="At least one special character" 
                    />
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid && (emailTouched || passwordTouched)}
                className={`w-full py-2 px-4 font-medium rounded-lg duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                  !isFormValid && (emailTouched || passwordTouched)
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-zinc-700 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-400 dark:hover:text-black'
                }`}
              >
                Sign Up
              </button>
              <Link href={"/login"} className='flex justify-center text-sm text-blue-700 border-blue-700 border rounded-full hover:text-blue-500 duration-500'>Log-in?</Link>
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

export default register