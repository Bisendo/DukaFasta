import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Back01 from "../assets/back02.jpg";

import Logo from "../assets/logo.png";

const TEXT = "Welcome to DukaFasta";
const BACKGROUNDS = [Back01];

const Landing = () => {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [textKey, setTextKey] = useState(0);

  // 🔁 Change image every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
      setTextKey((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">

      {/* 🔵 LEFT SIDE (BLUE CONTENT AREA) */}
      <div className="relative flex flex-col justify-center px-6 sm:px-10 md:px-14 bg-gradient-to-br from-blue-900 to-blue-700 text-white">

        {/* LOGO */}
        <div className="absolute top-5 left-6 flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-10 w-auto object-contain rounded" />
          <span className="font-bold text-lg hidden sm:block">
            DukaFasta
          </span>
        </div>

        {/* CONTENT */}
        <div className="max-w-xl mt-16">

          {/* TYPING TITLE */}
          <motion.h1
            key={textKey}
            initial={{ width: "0ch" }}
            animate={{ width: `${TEXT.length}ch` }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="overflow-hidden whitespace-nowrap border-r-4 border-cyan-400 pr-3
                       text-2xl sm:text-3xl md:text-3xl font-bold mb-6"
          >
            {TEXT}
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4, duration: 1 }}
            className="text-sm sm:text-base md:text-lg text-gray-200 mb-8"
          >
            Manage stock, track products, and control your business operations
            faster and smarter using our modern DukaFasta platform.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => navigate("/login")}
              className="bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-lg
                         text-base sm:text-lg font-semibold shadow-lg transition active:scale-95"
            >
              Get Started
            </button>

            <button
            onClick={()=>navigate("/login")}
              className="border border-white hover:bg-white hover:text-blue-900
                         px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* 🖼️ RIGHT SIDE (IMAGE SLIDER) */}
      <div className="relative hidden md:block">

        <AnimatePresence mode="wait">
          <motion.img
            key={bgIndex}
            src={BACKGROUNDS[bgIndex]}
            alt="DukaFasta Background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-blue-900/30"></div>
      </div>
    </div>
  );
};

export default Landing;
