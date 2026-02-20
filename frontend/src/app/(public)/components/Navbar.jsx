"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  LogOut,
  Search,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  User,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sideMenuRef = useRef();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search as user types (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/public`,
        {
          params: {
            search: query,
            limit: 5,
          },
        },
      );
      setSearchResults(response.data.blogs);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openMenu = () => {
    sideMenuRef.current.style.transform = "translateX(16rem)";
  };

  const closeMenu = () => {
    sideMenuRef.current.style.transform = "translateX(-16rem)";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="md:hidden flex">
            <button
              onClick={openMenu}
              className="cursor-pointer text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/">
              <div className="px-2.5 py-1 bg-indigo-600 rounded-lg">
                <span className="text-white font-bold text-xl">DailyMart</span>
              </div>
            </Link>
          </div>

          <div ref={searchRef} className="relative">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="md:w-100 lg:w-125 mx-auto">
              <div className="flex items-center justify-between bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowResults(true)
                  }
                  placeholder="Search to get products..."
                  className="px-4 text-gray-700 text-base outline-none placeholder-gray-400"
                />

                <button
                  type="submit"
                  className="cursor-pointer p-2 m-0.75 bg-orange-600 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
                {searchResults.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blogs/${blog.slug}`}
                    onClick={handleResultClick}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    {/* Blog Image */}
                    <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Blog Info */}
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {blog.title}
                      </h3>
                      {blog.subTitle && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {blog.subTitle}
                        </p>
                      )}
                      {/* <p className="text-sm text-gray-500 line-clamp-2">
                      {truncateText(stripHtml(blog.content), 120)}
                    </p> */}
                    </div>
                  </Link>
                ))}

                {/* View All Results */}
                <button
                  onClick={() => {
                    setShowResults(false);
                    router.push(
                      `/blogs?search=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }}
                  className="cursor-pointer w-full p-4 text-center text-green-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  View all results for `{searchQuery}`
                </button>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            )}

            {/* No Results */}
            {showResults &&
              !isSearching &&
              searchQuery.trim().length >= 2 &&
              searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    No results found for `{searchQuery}`
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              )}
          </div>

          <div className="flex justify-between items-center gap-6">
            <div className="relative cursor-pointer p-2.25 bg-gray-100 hover:bg-gray-200 rounded-full">
              <Heart strokeWidth={2.5} className="w-5 h-5 text-blue-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold w-4.25 h-4.25 flex items-center justify-center rounded-full">
                2
              </span>
            </div>
            <div className="relative cursor-pointer p-2.25 bg-gray-100 hover:bg-gray-200 rounded-full">
              <ShoppingCart
                strokeWidth={2.5}
                className="w-5 h-5 text-blue-500"
              />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold w-4.25 h-4.25 flex items-center justify-center rounded-full">
                2
              </span>
            </div>
          </div>
          <div>
            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="cursor-pointer border-2 border-amber-300 hover:border-amber-500 rounded-full transition-all shadow-md hover:shadow-lg"
                  >
                    <div className="w-7 h-7 rounded-full bg-linear-to-br bg-orange-400  flex items-center justify-center">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user?.name || "User"}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm profile-text-padd">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition duration-150"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="mb-1" size={18} />
                          <span>Profile</span>
                        </div>
                      </Link>

                      <hr className="my-2 border-gray-100" />

                      <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-150"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut size={18} />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="sm:flex items-center space-x-4 hidden">
                  <Link
                    href="/login"
                    className="pl-2 pr-2.5 py-1.5 bg-orange-500 text-white rounded-md hover:bg-indigo-600 transition duration-150"
                  >
                    <div className="flex justify-between items-center gap-0.75">
                      <User className="w-5 h-5" />
                      Login
                    </div>
                  </Link>
                </div>
                <div className="flex items-center sm:hidden">
                  <Link
                    href="/login"
                    className="p-1.5 bg-orange-500 text-white rounded-full hover:bg-indigo-600 transition duration-150"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}

        <div
          ref={sideMenuRef}
          className="md:hidden fixed -left-64 top-0 w-50 z-50 bg-rose-50 duration-400 space-y-2 rounded-br-lg"
        >
          <div className="flex justify-between items-center px-4 py-3 bg-amber-300">
            <span className="text-xl font-bold text-gray-800">Menu</span>

            <button
              className="cursor-pointer text-indigo-600 hover:text-red-500"
              onClick={closeMenu}
            >
              <XCircle />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
