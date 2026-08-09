import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // Notification State
  const [notification, setNotification] = useState({
    message: "",
    type: "", // "success" | "error"
    visible: false,
  });

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;

      await axios.post("http://localhost:4001/users/owner", payload);

      showNotification("🎉 Business Owner Account Created Successfully!", "success");

      // Redirect after a short delay
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || "Registration failed";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Navbar />

      {/* Notification */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } animate-slide-in`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Register Business Owner
          </h2>

          <p className="text-center text-gray-600 mb-8">
            Create your owner account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-lg ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Owner Account"}
            </button>

            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 cursor-pointer"
              >
                Login
              </span>
            </p>

          </form>
        </div>
      </div>

      {/* Tailwind animation for notification */}
      <style>
        {`
          @keyframes slide-in {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
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
