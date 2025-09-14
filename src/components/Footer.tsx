import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const customerLinks = [
    { name: "Browse Dresses", to: "/dresses" },
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
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" }
  ];

  const contactInfo = [
    { icon: Phone, text: "+91 9380111579" },
    { icon: Mail, text: "support@dresstracker.com" },
    { icon: MapPin, text: "Ballari, Karnataka" }
  ];

  const paymentMethods = [
    "Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"
  ];

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
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center 
                             hover:bg-pink-500 hover:scale-110 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </a>
              ))}
            </div>
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

        </div>

        

       
        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 DressTracker. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <a href="#" className="text-gray-400 hover:text-pink-400 text-sm hover:underline">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 text-sm hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 text-sm hover:underline">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
