import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import {jwtDecode} from 'jwt-decode';
import logo from "../assets/batiksekarniti.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserData = () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      // Decode token untuk mendapatkan user info
      const decoded = jwtDecode(token);
      console.log('🔑 Decoded token:', decoded);

      setIsLoggedIn(true);
      
      // Ambil nama dari token atau localStorage
      const name = decoded.name || decoded.display_name || localStorage.getItem('display_name') || 'User';
      const email = decoded.email || localStorage.getItem('user_email') || '';
      
      setUserName(name);
      setUserEmail(email);

    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('display_name');
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  // Get first name or first word from full name
  const getDisplayName = () => {
    if (!userName) return 'User';
    const firstName = userName.split(' ')[0];
    return firstName.length > 12 ? firstName.substring(0, 12) + '...' : firstName;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Batik Sekarniti Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-red-900' : 'text-gray-600 hover:text-red-900'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/sejarah"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-red-900' : 'text-gray-600 hover:text-red-900'
              }`
            }
          >
            Sejarah
          </NavLink>

          <NavLink
            to="/filosofi"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-red-900' : 'text-gray-600 hover:text-red-900'
              }`
            }
          >
            Filosofi & Visi
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-red-900' : 'text-gray-600 hover:text-red-900'
              }`
            }
          >
            Shop
          </NavLink>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
          </Link>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <UserCircle className="w-5 h-5" />
                <span>{getDisplayName()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-900 text-white text-sm font-semibold rounded-lg hover:bg-red-800 transition"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-4 space-y-3">
            {/* User Info (Mobile) */}
            {isLoggedIn && (
              <div className="pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}

            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-900"
            >
              Home
            </NavLink>
            <NavLink
              to="/sejarah"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-900"
            >
              Sejarah
            </NavLink>
            <NavLink
              to="/filosofi"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-900"
            >
              Filosofi & Visi
            </NavLink>
            <NavLink
              to="/shop"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-900"
            >
              Shop
            </NavLink>
            <NavLink
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-900"
            >
              Keranjang
            </NavLink>
            
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-gray-700 hover:text-red-900"
                >
                  Profil Saya
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-red-900 font-semibold"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
    );
}