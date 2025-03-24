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
  
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const [emailValidation, setEmailValidation] = useState({
    isValidFormat: false,
    hasAtSymbol: false,
    hasDomain: false,
    hasExtension: false,
  });

  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showEmailValidation, setShowEmailValidation] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate password in real-time
  useEffect(() => {
    const password = formData.password;
    
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [formData.password]);

  // Validate email in real-time
  useEffect(() => {
    const email = formData.email;
    
    setEmailValidation({
      isValidFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      hasAtSymbol: email.includes('@'),
      hasDomain: /@[^\s@]+/.test(email),
      hasExtension: /\.[a-zA-Z]{2,}$/.test(email),
    });
  }, [formData.email]);

  // Check if form is valid
  useEffect(() => {
    const { minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial } = passwordValidation;
    const isPasswordValid = minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    
    const { isValidFormat } = emailValidation;
    const isEmailValid = isValidFormat;
    
    setIsFormValid(isPasswordValid && isEmailValid);
  }, [passwordValidation, emailValidation]);

  if (!mounted) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Show validation feedback based on field
    if (e.target.name === 'password') {
      setShowPasswordValidation(true);
    }
    
    if (e.target.name === 'email') {
      setShowEmailValidation(true);
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError(null);
    
    // Check if form is valid
    if (!isFormValid) {
      setError("Please correct all validation errors before submitting");
      return;
    }
    
    try {
      const res = await axios.post('/api/register', formData);
      if (res.status === 201) {
        router.push('/login');
      }
    }
    catch (error) {
      console.error("Registration error:", error.response?.data?.error || error.message);
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  // Helper function to render validation indicators
  const ValidationIndicator = ({ isValid, text }) => (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`text-xs ${isValid ? 'text-green-500' : 'text-red-500'}`}>{text}</span>
    </div>
  );

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="h-[100vh] flex flex-col lg:flex-row overflow-hidden items-center justify-center bg-black w-full gap-4 mx-auto px-8 relative"
      >
        <div onMouseEnter={() => {setHovered(false)}} onMouseLeave={() => {setHovered(true)}} className="z-20 flex items-center justify-center bg-black dark:bg-black">
          <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white text-center mb-6">
              Sign Up
            </h1>
            <form className="space-y-4 z-50" onSubmit={handleSubmit}>
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
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${emailValidation.isValidFormat ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                />
              </div>
              
              {/* Email validation feedback */}
              {showEmailValidation && !emailValidation.isValidFormat && (
                <div className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-md space-y-1">
                  <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email requirements:</h3>
                  <ValidationIndicator isValid={emailValidation.hasAtSymbol} text="Must include @ symbol" />
                  <ValidationIndicator isValid={emailValidation.hasDomain} text="Must have domain name after @" />
                  <ValidationIndicator isValid={emailValidation.hasExtension} text="Must include domain extension (.com, .org, etc.)" />
                </div>
              )}
              
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
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border ${
                    formData.password && passwordValidation.minLength && 
                    passwordValidation.hasUpperCase && 
                    passwordValidation.hasLowerCase && 
                    passwordValidation.hasNumber && 
                    passwordValidation.hasSpecial 
                      ? 'border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none`}
                />
              </div>
              
              {/* Password validation feedback */}
              {showPasswordValidation && (
                <div className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-md space-y-1">
                  <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password must contain:</h3>
                  <ValidationIndicator isValid={passwordValidation.minLength} text="At least 8 characters" />
                  <ValidationIndicator isValid={passwordValidation.hasUpperCase} text="At least one uppercase letter" />
                  <ValidationIndicator isValid={passwordValidation.hasLowerCase} text="At least one lowercase letter" />
                  <ValidationIndicator isValid={passwordValidation.hasNumber} text="At least one number" />
                  <ValidationIndicator isValid={passwordValidation.hasSpecial} text="At least one special character" />
                </div>
              )}
              
              {/* Error message */}
              {error && <div className="text-red-700 text-sm">{error}</div>}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-2 px-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 duration-500
                  ${isFormValid 
                    ? "bg-zinc-700 text-white hover:bg-zinc-900 hover:text-white dark:bg-zinc-700 dark:hover:bg-zinc-400 dark:hover:text-black" 
                    : "bg-zinc-400 text-zinc-200 cursor-not-allowed dark:bg-zinc-900 dark:text-zinc-700"}`}
              >
                Sign Up
              </button>
              
              <Link href={"/login"} className="flex justify-center text-sm text-blue-700 border-blue-700 border rounded-full hover:text-blue-500 duration-500">Log-in?</Link>
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