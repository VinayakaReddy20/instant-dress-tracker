import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, User, Star, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Feedback");

  const customerLinks = [
    { name: "Browse Dresses", to: "/dresses" },
    { name: "Find Shops", to: "/shops" }
  ];

  const companyLinks = [
    { name: "About Us", to: "#about" }
  ];

  const supportLinks = [
    { name: "Feedback", to: "#" },
  ];

  const paymentMethods = [
    "Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || rating === 0) {
      alert("Please provide a rating and feedback message.");
      return;
    }

    const fullMessage = `
Name: ${name || "Anonymous"}
Email: ${email || "Not provided"}
Category: ${category}
Rating: ${rating} star${rating > 1 ? "s" : ""}
Feedback: ${feedbackText.trim()}
    `.trim();

    try {
      // Send feedback email via backend API or email service
      // Here, we simulate sending email by calling a backend endpoint
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "vinaysdr02@gmail.com",
          subject: `New Feedback from DressTracker - ${category}`,
          message: fullMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      alert("Thank you for your feedback! We appreciate your input.");
      setFeedbackText("");
      setRating(0);
      setName("");
      setEmail("");
      setCategory("General Feedback");
      setShowFeedbackForm(false);
    } catch (error) {
      alert("Error sending feedback. Please try again later.");
      console.error(error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DT</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">DressTracker</h3>
                <p className="text-sm text-gray-300">Find Your Perfect Dress</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Your ultimate destination for luxury dress shopping with real-time inventory tracking
              and seamless shop discovery across partner boutiques and stores.
            </p>

            {/* Contact Info */}


          </div>

          {/* Customer Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Customer Service</h4>
            <ul className="space-y-3">
              {customerLinks.map((link, index) => (
                <li key={index}>
                  {link.to.startsWith("#") ? (
                    <a
                      href={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  {link.to.startsWith("#") ? (
                    <a
                      href={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  {link.name === "Feedback" ? (
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </button>
                  ) : link.to.startsWith("#") ? (
                    <a
                      href={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300
                                 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>




        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 DressTracker. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">

            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DT</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Share Your Feedback</h3>
                    <p className="text-sm text-gray-600">Help us improve your DressTracker experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  How would you rate your experience? <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                >
                  <option>General Feedback</option>
                  <option>Product Quality</option>
                  <option>Customer Service</option>
                  <option>Website Usability</option>
                  <option>Order & Delivery</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Feedback Text */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-colors"
                  rows={4}
                  placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center shadow-lg"
                >
                  <Send className="mr-2" size={18} />
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</footer>
  );
};

export default Footer;
