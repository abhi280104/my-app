import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-24">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* About Section */}
        <div>
          <h3 className="text-xl font-bold text-indigo-600 mb-4">ShopEase</h3>
          <p className="text-gray-600">
            ShopEase is your one-stop online shop for fashion, electronics, home goods, and more. Quality products delivered at your doorstep.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-indigo-500 transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-indigo-500 transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-indigo-500 transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-indigo-500 transition">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:text-indigo-500 transition">Featured Products</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">New Arrivals</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Deals</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Categories</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">My Account</a></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Customer Care</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:text-indigo-500 transition">Help Center</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Shipping Info</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Track Order</a></li>
            <li><a href="#" className="hover:text-indigo-500 transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Newsletter</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to get the latest news, deals & offers.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            />
            <button className="px-6 bg-indigo-600 text-white font-medium rounded-r-2xl hover:bg-indigo-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>!Enjoy Shopping</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-indigo-500 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-indigo-500 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-indigo-500 transition cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
