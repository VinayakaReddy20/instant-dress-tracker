<<<<<<< HEAD
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
=======
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
>>>>>>> 8cbccc3fc790eb12482d4f0161e7d7233234c207

const Footer = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const customerLinks = [
    { name: "Browse Dresses", to: "/dresses" },
<<<<<<< HEAD
    { name: "Find Shops", to: "/shops" }
  ];

  const companyLinks = [
    { name: "About Us", to: "#about" }
  ];

  const supportLinks = [
    { name: "Feedback", to: "#" },
    
=======
    { name: "Find Shops", to: "/shops" },
    { name: "Style Advice", to: "#" },
    { name: "FAQs", to: "#" }
  ];

  const companyLinks = [
    { name: "About Us", to: "#about" },
    { name: "Our Partners", to: "#" },
    { name: "Careers", to: "#" },
  ];

  const supportLinks = [
    { name: "Contact Us", to: "#" },
    { name: "Privacy Policy", to: "#" }
>>>>>>> 8cbccc3fc790eb12482d4f0161e7d7233234c207
  ];

  
  

  const paymentMethods = [
    "Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      // Send feedback email via backend API or email service
      // Here, we simulate sending email by calling a backend endpoint
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "vinaysdr02@gmail.com",
          subject: "New Feedback from DressTracker",
          message: feedbackText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      alert("Thank you for your feedback!");
      setFeedbackText("");
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
<<<<<<< HEAD
                  {link.name === "Feedback" ? (
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-sm hover:underline block py-1"
                    >
                      {link.name}
                    </button>
                  ) : link.to.startsWith("#") ? (
=======
                  {link.to.startsWith("#") ? (
>>>>>>> 8cbccc3fc790eb12482d4f0161e7d7233234c207
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Send Feedback</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                rows={5}
                placeholder="Enter your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Send
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
<<<<<<< HEAD

=======
>>>>>>> 8cbccc3fc790eb12482d4f0161e7d7233234c207
