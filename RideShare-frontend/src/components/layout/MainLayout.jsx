
import React from 'react';
import Navbar from './Navbar';
import { useUserContext } from '../../context/UserContext';

const MainLayout = ({ children }) => {
  const { user } = useUserContext();

  return (
    <div className="flex flex-col min-h-screen">
      {user && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} ShareWheels - Connect, Ride, Arrive Together</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
