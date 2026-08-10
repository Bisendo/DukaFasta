import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import axios from "axios";
import Navbar from "../Components/Navbar";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  // ============================================
  // HIDE NOTIFICATION AFTER 3 SECONDS
  // ============================================
  useEffect(() => {
    if (!notification.visible) return;

    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.visible]);

  // ============================================
  // HANDLE INPUT
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ============================================
  // VALIDATE FORM
  // ============================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // SHOW NOTIFICATION
  // ============================================
  const showNotification = (message, type) => {
    setNotification({
      message,
      type,
      visible: true,
    });
  };

  // ============================================
  // REGISTER OWNER
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      console.warn(
        "⚠️ Registration stopped because form validation failed."
      );
      return;
    }

    setLoading(true);

    console.log("======================================");
    console.log("🚀 OWNER REGISTRATION STARTED");
    console.log("======================================");

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...payload } = formData;

      console.log("📤 Sending registration request:");
      console.log({
        ...payload,
        password: "********",
      });

      console.log(
        "🌐 API URL:",
        `${API_BASE_URL}/users/owner`
      );

      // ========================================
      // SEND REQUEST
      // ========================================
      const response = await axios.post(
        `${API_BASE_URL}/users/owner`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ========================================
      // SHOW COMPLETE BACKEND RESPONSE
      // ========================================
      console.log("======================================");
      console.log("✅ REGISTRATION RESPONSE");
      console.log("======================================");

      console.log("HTTP Status:", response.status);

      console.log("Response Headers:", response.headers);

      console.log("Response Data:", response.data);

      console.log(
        "Owner Information:",
        response.data?.owner
      );

      console.log(
        "Backend Message:",
        response.data?.message
      );

      // ========================================
      // CHECK EMAIL STATUS
      // ========================================
      if (response.data?.emailSent === true) {
        console.log("======================================");
        console.log("📧 EMAIL STATUS");
        console.log("======================================");
        console.log("✅ Welcome email was sent successfully.");
        console.log(
          "📩 Email sent to:",
          response.data?.owner?.email
        );

        showNotification(
          "🎉 Account created! Welcome email sent successfully.",
          "success"
        );
      } else if (response.data?.emailSent === false) {
        console.warn("======================================");
        console.warn("⚠️ EMAIL STATUS");
        console.warn("======================================");
        console.warn(
          "Account was created, but the welcome email was NOT sent."
        );
        console.warn(
          "Email error:",
          response.data?.emailError
        );

        showNotification(
          "Account created, but the welcome email could not be sent.",
          "error"
        );
      } else {
        console.warn("======================================");
        console.warn("⚠️ EMAIL STATUS UNKNOWN");
        console.warn("======================================");
        console.warn(
          "Backend did not return emailSent."
        );

        showNotification(
          "🎉 Account created successfully.",
          "success"
        );
      }

      console.log("======================================");
      console.log("🏁 REGISTRATION FINISHED");
      console.log("======================================");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      // ========================================
      // AXIOS ERROR
      // ========================================
      console.error("======================================");
      console.error("❌ REGISTRATION ERROR");
      console.error("======================================");

      console.error("Full error:", error);

      console.error(
        "HTTP Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      console.error(
        "Request URL:",
        error.config?.url
      );

      console.error(
        "Request Method:",
        error.config?.method
      );

      console.error(
        "Network error:",
        error.message
      );

      // Get backend error message
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      showNotification(message, "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ========================================
          NAVBAR
      ======================================== */}
      <Navbar />

      {/* ========================================
          NOTIFICATION
      ======================================== */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg text-white max-w-md ${
            notification.type === "success"
              ? "bg-green-500"
              : "bg-red-500"
          } animate-slide-in`}
        >
          {notification.message}
        </div>
      )}

      {/* ========================================
          REGISTER FORM
      ======================================== */}
      <div className="flex items-center justify-center py-10 px-4">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Register Business Owner
          </h2>

          <p className="text-center text-gray-600 mb-8">
            Create your owner account
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* FIRST NAME */}
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.firstName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.lastName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.phoneNumber
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className={`w-full border px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Creating..."
                : "Create Owner Account"}
            </button>

            {/* LOGIN */}
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}

              <span
                onClick={() => {
                  if (!loading) {
                    navigate("/login");
                  }
                }}
                className={`text-blue-600 cursor-pointer hover:underline ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Login
              </span>
            </p>

          </form>
        </div>
      </div>

      {/* ========================================
          ANIMATION
      ======================================== */}
      <style>
        {`
          @keyframes slide-in {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }

            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in {
            animation: slide-in 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Register;
