import React, { useState } from "react";
import {API_BASE_URL} from "../config"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();

  // States
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification({ message: "", type: "", visible: false }), 3000);
  };

  // ================= LOGIN HANDLER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return showNotification("Please fill in all fields", "error");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/users/login`, formData);

      console.log("Login Response:", res.data);

      const { token, user } = res.data;

      // Save token and user in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set axios default Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      showNotification("Login successful!", "success");

      // Redirect based on role
      setTimeout(() => {
        if (user.role === "owner") navigate("/owner-dashboard");
        else if (user.role === "shopkeeper") navigate("/shopkeeper-dashboard");
        else navigate("/admin-dashboard");
      }, 1000);

    } catch (err) {
      console.error("Login Error:", err.response?.data || err);
      showNotification(err.response?.data?.error || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= FORGOT PASSWORD HANDLERS =================

  // Generate random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Start countdown for resend
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      return showNotification("Please enter your email", "error");
    }

    try {
      setResetLoading(true);
      
      // Generate OTP
      const otpCode = generateOTP();
      setGeneratedOtp(otpCode);

      // Send OTP via email
      const res = await axios.post(`${API_BASE_URL}/users/send-otp`, {
        email: resetEmail,
        otp: otpCode
      });

      if (res.data.success) {
        showNotification("OTP sent to your email!", "success");
        setResetStep(2);
        startCountdown();
      } else {
        showNotification("Failed to send OTP", "error");
      }

    } catch (err) {
      console.error("Send OTP Error:", err.response?.data || err);
      showNotification(err.response?.data?.error || "Failed to send OTP", "error");
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    
    if (!otp) {
      return showNotification("Please enter OTP", "error");
    }

    if (otp !== generatedOtp) {
      return showNotification("Invalid OTP code", "error");
    }

    showNotification("OTP verified successfully!", "success");
    setResetStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return showNotification("Please fill in all fields", "error");
    }

    if (newPassword.length < 6) {
      return showNotification("Password must be at least 6 characters", "error");
    }

    if (newPassword !== confirmPassword) {
      return showNotification("Passwords do not match", "error");
    }

    try {
      setResetLoading(true);

      const res = await axios.post(`${API_BASE_URL}/users/reset-password`, {
        email: resetEmail,
        newPassword: newPassword
      });

      if (res.data.success) {
        showNotification("Password reset successfully! Please login.", "success");
        
        // Reset all forgot password states
        setShowForgotPassword(false);
        setResetStep(1);
        setResetEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setGeneratedOtp("");
      } else {
        showNotification("Failed to reset password", "error");
      }

    } catch (err) {
      console.error("Reset Password Error:", err.response?.data || err);
      showNotification(err.response?.data?.error || "Failed to reset password", "error");
    } finally {
      setResetLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setResetLoading(true);
      
      const otpCode = generateOTP();
      setGeneratedOtp(otpCode);

      const res = await axios.post(`${API_BASE_URL}/users/send-otp`, {
        email: resetEmail,
        otp: otpCode
      });

      if (res.data.success) {
        showNotification("New OTP sent to your email!", "success");
        startCountdown();
      }

    } catch (err) {
      showNotification("Failed to resend OTP", "error");
    } finally {
      setResetLoading(false);
    }
  };

  // Go back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setGeneratedOtp("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Navbar />

      {/* Notification */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header with Back Button for Forgot Password */}
          {showForgotPassword ? (
            <div className="flex items-center mb-6">
              <button 
                onClick={handleBackToLogin}
                className="mr-3 text-gray-600 hover:text-blue-600 transition"
              >
                <FiArrowLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold">Reset Password</h2>
            </div>
          ) : (
            <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
          )}

          {/* Login Form */}
          {!showForgotPassword && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <FiLock /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {showForgotPassword && (
            <div className="flex flex-col gap-5">
              
              {/* Step Indicators */}
              <div className="flex justify-between mb-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        resetStep >= step 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {resetStep > step ? <FiCheckCircle /> : step}
                    </div>
                    <span className="text-xs mt-1 text-gray-500">
                      {step === 1 ? "Email" : step === 2 ? "OTP" : "New Password"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Enter Email */}
              {resetStep === 1 && (
                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <p className="text-gray-600 text-sm mb-2">
                    Enter your email address and we'll send you an OTP to reset your password.
                  </p>
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <FiMail /> Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 font-semibold"
                  >
                    {resetLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                  <p className="text-gray-600 text-sm mb-2">
                    Enter the 6-digit OTP sent to <strong>{resetEmail}</strong>
                  </p>
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <FiLock /> OTP Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      required
                    />
                  </div>
                  
                  {/* Resend OTP */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Didn't receive code?
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || resetLoading}
                      className={`${
                        countdown > 0 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "text-blue-600 hover:underline"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 font-semibold"
                  >
                    {resetLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <p className="text-gray-600 text-sm mb-2">
                    Enter your new password
                  </p>
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <FiLock /> New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <FiLock /> Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 font-semibold"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Register Link (only show on login form) */}
          {!showForgotPassword && (
            <div className="mt-5 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:underline font-medium"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;