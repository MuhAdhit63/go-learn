import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const DashboardLayout = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className=''>
        <nav className="bg-gray-800 border-gray-200 px-4 lg:px-6 py-2.5 fixed w-full">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a href="#" className="flex items-center">
              <img src="/logo.png" className="mr-3 h-6 sm:h-9" alt="Logo" />
              <span className="self-center text-xl font-semibold whitespace-nowrap text-white">GoLearn</span>
            </a>
            <div className="flex items-center lg:order-2">
              <span className="text-white hidden sm:block mr-4">Hello, {session?.user?.email}!</span>
               <button onClick={handleLogout} className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none flex gap-2 items-center">
                    <FaSignOutAlt/> Logout
               </button>
            </div>
            <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                <li>
                  <Link to="/dashboard" className="block py-2 pr-4 pl-3 text-gray-400 hover:text-white lg:p-0" end>Home</Link>
                </li>
                <li>
                  <Link to="/dashboard/materials" className="block py-2 pr-4 pl-3 text-gray-400 hover:text-white lg:p-0">Materials</Link>
                </li>
                <li>
                  <Link to="/dashboard/quizzes" className="block py-2 pr-4 pl-3 text-gray-400 hover:text-white lg:p-0">Quiz</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main className='pt-16'>
        {/* Di sinilah konten (Dashboard, MaterialsPage, dll) akan dirender */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;