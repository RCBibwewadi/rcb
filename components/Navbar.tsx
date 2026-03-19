"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

/* eslint-disable @next/next/no-html-link-for-pages */

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Scroll handler can be used for future features
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect luxury-shadow">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Image src={"/logo.jpg"} alt={"Logo"} height={40} width={40} />
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
          <Link
            href="/quick"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            FOMO
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </Link>
          <a
            href="/#home"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            Home
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="/#about"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            About
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="/#board"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            BOD
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="/#projects"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            Projects
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="/#events"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            Events
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="/#join"
            className="relative font-medium text-mauve-wine hover:text-rose-tan transition-colors group"
          >
            Join Us
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-tan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="https://www.instagram.com/rotaractclubofbibwewadipune?igsh=Z2s0bTEwd2hoaTFj"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2"
          >
            <Instagram className="w-6 h-6 hover:text-rose-tan" />
          </a>
        </div>
        <a
          href="https://www.instagram.com/rotaractclubofbibwewadipune?igsh=Z2s0bTEwd2hoaTFj"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden mr-2"
        >
          <Instagram className="w-6 h-6 hover:text-rose-tan" />
        </a>
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
            <Link
              href="/quick"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              FOMO
            </Link>
            <a
              href="/#home"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              Home
            </a>
            <a
              href="/#about"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              About
            </a>
            <a
              href="/#board"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              BOD
            </a>
            <a
              href="/#projects"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              Projects
            </a>
            <a
              href="/#events"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              Events
            </a>
            <a
              href="/#join"
              className="text-mauve-wine hover:text-rose-tan font-medium py-2"
            >
              Join Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
