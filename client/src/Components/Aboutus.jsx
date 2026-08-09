import React from "react";
import Navbar from "./Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔰 NAVBAR */}
      <Navbar />

      {/* 🌍 ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              About Our System
            </h2>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
              Our Inventory Management System is designed to help businesses
              efficiently manage stock, track products, and streamline daily
              operations with accuracy and speed.
            </p>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              We focus on simplicity, performance, and security so businesses
              can make smarter decisions and grow with confidence.
            </p>
          </div>

          {/* RIGHT INFO BOX */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              Why Choose Us?
            </h3>

            <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
              <li>✔ Easy product & stock management</li>
              <li>✔ Secure and reliable system</li>
              <li>✔ Real-time inventory tracking</li>
              <li>✔ User-friendly interface</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 🛠️ SERVICES SECTION */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-900 mb-12">
            Our Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SERVICE CARD */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                📦 Inventory Management
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Track stock levels, manage products, and reduce inventory
                losses with real-time updates.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                📊 Reports & Analytics
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Generate accurate reports to understand sales trends and
                inventory performance.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                🔐 Secure User Management
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Manage users, roles, and permissions with strong authentication
                and authorization.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                🛒 Sales Tracking
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Monitor sales activities, transactions, and customer purchases
                efficiently.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                ☁️ Cloud Ready System
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Access your system anytime, anywhere with secure cloud-based
                technology.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                🧑‍💻 Technical Support
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Get reliable technical assistance and system support whenever
                you need help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📞 CONTACT SECTION */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-900 mb-12">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* CONTACT INFO */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Get in Touch
              </h3>

              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                Have questions or need support? Reach out to us and we’ll be
                happy to assist you.
              </p>

              <div className="space-y-4 text-gray-700 text-sm sm:text-base">
                <p><span className="font-semibold">📍 Address:</span> Dar es Salaam, Tanzania</p>
                <p><span className="font-semibold">📧 Email:</span> info@inventorysystem.com</p>
                <p><span className="font-semibold">📞 Phone:</span> +255 747 617 575</p>
              </div>
            </div>

            {/* CONTACT FORM */}
            <form className="bg-gray-50 p-8 rounded-xl shadow-md space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                rows="4"
                placeholder="Write your message..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 🔚 FOOTER */}
      <footer className="bg-blue-900 text-white text-center py-4 text-sm">
        © {new Date().getFullYear()} Inventory Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
