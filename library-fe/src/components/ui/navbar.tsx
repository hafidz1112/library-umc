import LogoUmc from "@/assets/logo_umc.png";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 px-10 bg-white shadow-sm">
      {/* Logo & Teks */}
      <div className="flex items-center space-x-2">
        <img
          src={LogoUmc} // Ganti dengan URL logo sebenarnya
          alt="UMC Library Logo"
          className="w-12 h-12 rounded-full"
        />
        <div className="text-sm font-bold text-gray-800">
          <span className="block">UMC</span>
          <span className="block">Library</span>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex text-md space-x-6 text-gray-700 font-medium">
        <a href="/" className="hover:text-red-600 transition-colors">
          Beranda
        </a>
        <a href="/katalog" className="hover:text-red-600 transition-colors">
          Katalog
        </a>
        <a href="/e-resource" className="hover:text-red-600 transition-colors">
          E-Resource
        </a>
        <a href="/tentang" className="hover:text-red-600 transition-colors">
          Tentang
        </a>
      </nav>

      {/* Tombol Login */}
      <div>
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
      </div>
    </div>
  );
};

export default Navbar;