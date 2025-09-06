"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect luxury-shadow">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-10 h-10 luxury-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-mauve-wine whitespace-nowrap">
              Rotaract Club of Bibwewadi Pune
            </h1>
            <p className="text-xs text-mauve-wine-light">
              From solos to symphony
            </p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 flex-shrink-0">
          <Link href="#home" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">Home</Link>
          <Link href="#about" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">About</Link>
          <Link href="#board" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">BOD</Link>
          <Link href="#projects" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">Projects</Link>
          <Link href="#events" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">Events</Link>
          <Link href="#join" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">Join Us</Link>
          <Link href="#contact" className="text-mauve-wine hover:text-rose-tan font-medium transition-colors">Contact</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-mauve-wine hover:text-rose-tan flex-shrink-0"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden pb-4 px-4">
          <div className="flex flex-col space-y-2">
            <Link href="#home" className="text-mauve-wine hover:text-rose-tan font-medium py-2">Home</Link>
            <Link href="#about" className="text-mauve-wine hover:text-rose-tan font-medium py-2">About</Link>
            <Link href="#projects" className="text-mauve-wine hover:text-rose-tan font-medium py-2">Projects</Link>
            <Link href="#events" className="text-mauve-wine hover:text-rose-tan font-medium py-2">Events</Link>
            <Link href="#join" className="text-mauve-wine hover:text-rose-tan font-medium py-2">Join Us</Link>
            <Link href="#contact" className="text-mauve-wine hover:text-rose-tan font-medium py-2">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
