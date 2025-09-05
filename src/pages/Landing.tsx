import { useState } from "react";
import { Search, Sparkles, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import heroBoutique from "@/assets/hero-boutique.jpg";

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBoutique})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-accent-gold to-accent-copper bg-clip-text text-transparent">
                Dress Instantly
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Connect with local shops and discover real-time dress availability. 
              Never miss out on your dream outfit again.
            </p>
            
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by dress name, style, size, or shop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/90 border-0 text-lg placeholder:text-gray-500 focus:bg-white"
                  />
                </div>
                <Button type="submit" className="btn-accent h-12 px-8 text-lg font-semibold">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent-gold/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-copper/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-6">
              Why Choose Instant Dress Tracker?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of dress shopping with real-time availability and seamless connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Real-Time Updates",
                description: "Get instant notifications when your desired dress becomes available in nearby shops."
              },
              {
                icon: MapPin,
                title: "Local Discovery",
                description: "Find shops near you and explore their complete dress collections with live inventory."
              },
              {
                icon: Sparkles,
                title: "Perfect Matches",
                description: "Advanced search filters help you find exactly what you're looking for in seconds."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="card-premium p-8 text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;