"use client";

import { Mail, Phone, MapPin, Twitter, Instagram, Github, Linkedin } from "lucide-react";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  return (
    <footer id="contact" className="bg-mauve-wine-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Club Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 luxury-gradient rounded-full flex items-center justify-center luxury-shadow">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Rotaract Club Bibwewadi</h3>
                <p className="text-rose-tan-light text-sm">From solos to symphony</p>
              </div>
            </div>
            <p className="text-luxury-cream leading-relaxed">
              Creating positive change through service, leadership, and fellowship in the Bibwewadi
              community and beyond.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-rose-tan mr-3" />
                <span className="text-luxury-cream">rotaractclubofbibwewadi@gmail.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-rose-tan mr-3" />
                <span className="text-luxury-cream">+91 91683 43950</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-rose-tan mr-3" />
                <span className="text-luxury-cream">Bibwewadi, Pune, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Follow Us</h4>
            <div className="flex space-x-4">
              {[
                { icon: <MdEmail className="w-5 h-5 text-white" />, colors: "from-rose-tan to-rose-tan-dark",href:"mailto:rotaractclubofbibwewadi@gmail.com"},
                { icon: <Instagram className="w-5 h-5 text-white" />, colors: "from-mauve-wine to-mauve-wine-dark",href:"https://www.instagram.com/rotaractclubofbibwewadipune?igsh=Z2s0bTEwd2hoaTFj" },
        
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-10 h-10 bg-gradient-to-br ${social.colors} rounded-full flex items-center justify-center hover-scale luxury-shadow transition-all`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-mauve-wine mt-12 pt-8 text-center">
          <p className="text-[#d1c2a2]">
            &copy; 2025 Rotaract Club of Bibwewadi Pune. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
