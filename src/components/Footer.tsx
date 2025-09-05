import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const customerLinks = [
    { name: "Browse Dresses", href: "/dresses" },
    { name: "Find Shops", href: "/shops" },
    { name: "Wishlist", href: "#" },
    { name: "Size Guide", href: "#" }
  ];

  const partnerLinks = [
    { name: "Shop Dashboard", href: "/dashboard" },
    { name: "Inventory Management", href: "#" },
    { name: "Analytics", href: "#" },
    { name: "Support", href: "#" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Contact", href: "#" }
  ];

  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-accent-copper rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DT</span>
              </div>
              <div>
                <h3 className="text-2xl font-playfair font-bold text-white">DressTracker</h3>
                <p className="text-sm text-white/70">Premium Inventory System</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-white/80 text-sm leading-relaxed">
              Your ultimate destination for luxury dress shopping with real-time inventory tracking 
              and seamless shop discovery. Experience fashion retail reimagined.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center 
                           hover:bg-white/20 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white font-playfair">For Customers</h4>
            <ul className="space-y-3">
              {customerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-300 
                             text-sm hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white font-playfair">For Partners</h4>
            <ul className="space-y-3">
              {partnerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-300 
                             text-sm hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter/Contact - Fourth Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white font-playfair">Stay Updated</h4>
            <p className="text-white/70 text-sm">
              Get notified about new features, dress arrivals, and exclusive shop partnerships.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder:text-white/50 focus:outline-none 
                         focus:border-white/40 transition-colors duration-300"
              />
              <button className="w-full px-4 py-2 bg-gradient-to-r from-accent-gold to-accent-copper 
                               text-white rounded-lg hover:opacity-90 transition-opacity duration-300 
                               font-medium text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-white/60 text-sm">
              © 2024 DressTracker. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-white/60 hover:text-white transition-colors duration-300 
                           text-sm hover:underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;