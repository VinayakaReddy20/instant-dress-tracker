import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, User, Star, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { feedbackSchema } from "../lib/validations";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      rating,
      category: category as "General Feedback" | "Bug Report" | "Suggestion" | "Experience",
      name: name || undefined,
      email: email || undefined,
      feedback: feedbackText,
    };

    const validation = feedbackSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message).join('\n');
      alert(`Validation errors:\n${errorMessages}`);
      return;
    }

    const subject = `New Feedback from DressTracker - ${category}`;
    const body = `Name: ${name || "Anonymous"}\nEmail: ${email || "Not provided"}\nCategory: ${category}\nRating: ${rating} star${rating > 1 ? "s" : ""}\nFeedback: ${feedbackText.trim()}`;

    // Open email client with pre-filled feedback
    window.location.href = `mailto:vinaysdr02@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    alert("Thank you for your feedback! Your email client has opened with the feedback details.");
    setFeedbackText("");
    setRating(0);
    setName("");
    setEmail("");
    setCategory("General Feedback");
    setShowFeedbackForm(false);
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DT</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Share Your Feedback</h3>
                    <p className="text-sm text-gray-300">Help us improve your DressTracker experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-4">
                  How would you rate your experience? <span className="text-red-400">*</span>
                </label>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none focus:ring-2 focus:ring-pink-500 rounded transition-transform hover:scale-110 p-1"
                    >
                      <Star
                        size={36}
                        className={`${
                          star <= rating ? "text-yellow-400 fill-current" : "text-gray-500"
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-200 mb-3">
                  Feedback Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                >
                  <option className="bg-gray-700">General Feedback</option>
                  <option className="bg-gray-700">Bug Report</option>
                  <option className="bg-gray-700">Suggestion</option>
                  <option className="bg-gray-700">Experience</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-3">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value.trim())}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Feedback Text */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-semibold text-gray-200 mb-3">
                  Your Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="feedback"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-colors placeholder-gray-400"
                  rows={4}
                  placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.trim())}
                  minLength={10}
                  maxLength={500}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors font-medium"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center shadow-lg hover:shadow-xl"
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
