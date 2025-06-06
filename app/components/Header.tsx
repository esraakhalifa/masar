import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center shadow-lg">
      <div className="text-xl font-bold tracking-wide">
        <Link href="/">Masar</Link>
      </div>
      <div className="flex-grow"></div>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/about" className="hover:text-purple-400 transition-colors duration-300">About</Link>
        <Link href="/contact" className="hover:text-purple-400 transition-colors duration-300">Contact</Link>
        <Link href="/login">
          <button className="text-white hover:text-purple-400 transition-colors duration-300">Login</button>
        </Link>
        <Link href="/register">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-500 transition-all duration-300 transform hover:scale-105">
            Sign Up
          </button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
