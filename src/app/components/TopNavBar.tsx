"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.jpg";
import { cx } from "lib/cx";
import { FileText, Search, Menu, X } from "lucide-react";

export const TopNavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/resume-builder",
      text: "Resume Builder",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: "/resume-parser",
      text: "Resume Parser",
      icon: <Search className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "sticky top-0 z-50 backdrop-blur-lg transition-all duration-200",
        "bg-white/80 shadow-sm"
      )}
    >
      <div className="flex h-[var(--top-nav-bar-height)] items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="sr-only">Logo</span>
          <Image
            src={logoSrc}
            alt="Logo"
            className="h-12 w-[13rem] object-contain"
            width={208}
            height={48}
            priority
            unoptimized
          />
        </Link>
        <button
          className="sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <nav
          aria-label="Site Nav Bar"
          className={cx(
            "fixed top-[var(--top-nav-bar-height)] left-0 bottom-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out sm:static sm:w-auto sm:shadow-none sm:translate-x-0",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
            "sm:flex sm:items-center sm:space-x-1"
          )}
        >
          {navItems.map(({ href, text, icon }) => (
            <Link
              key={text}
              className={cx(
                "flex items-center space-x-2 px-4 py-2 sm:rounded-full sm:px-3 sm:py-1.5 text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              href={href}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className={cx(
                pathname === href 
                  ? "text-gray-900" 
                  : "text-gray-400"
              )}>
                {icon}
              </span>
              <span className="sm:hidden md:inline">{text}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default TopNavBar;