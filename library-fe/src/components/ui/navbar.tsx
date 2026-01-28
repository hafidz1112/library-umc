import { useState, useEffect, useRef } from "react";
import LogoUmc from "@/assets/logo_umc.png";
import { authClient } from "@/lib/auth-client";
import { LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tutup menu saat tekan Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Katalog", href: "/katalog" },
    { name: "E-Resource", href: "/e-resource" },
    { name: "Tentang", href: "/tentang" },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <>
      {/* NAVBAR UTAMA */}
      <div className="flex justify-between items-center p-4 px-6 bg-white shadow-sm">
        {/* Logo & Teks */}
        <div className="flex items-center space-x-2">
          <img
            src={LogoUmc}
            alt="UMC Library Logo"
            className="w-10 h-10 rounded-full sm:w-12 sm:h-12"
          />
          <div className="text-sm font-bold text-gray-800">
            <span className="block">UMC</span>
            <span className="block">Library</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex text-md space-x-6 text-gray-700 font-medium">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="hover:text-red-600 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* User Menu / Login Button - Desktop */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-white border border-gray-200 rounded-full px-2 py-1 hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                {/* Name */}
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {session.user?.name || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  {(session.user as any).role === "super_admin" && (
                    <a
                      href="/dashboard/super-admin"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1 hover:bg-red-800 transition-colors"
            >
              <span>SSO Login</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Hamburger Menu - Mobile */}
        <button
          className="md:hidden hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
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

      {/* SIDEBAR MOBILE - ANIMASI SMOOTH */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <img
                src={LogoUmc}
                alt="UMC Library Logo"
                className="w-10 h-10 rounded-full"
              />
              <div className="text-sm font-bold text-gray-800">
                <span className="block">UMC</span>
                <span className="block">Library</span>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-4 mt-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-red-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Menu / Login - Mobile */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200 flex-shrink-0">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                {(session.user as any).role === "super_admin" && (
                  <a
                    href="/dashboard/super-admin"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="w-full bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center space-x-2 hover:bg-red-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>SSO Login</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-70 z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
