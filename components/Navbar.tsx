import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, TrophyIcon, WalletIcon, UserCircleIcon } from './icons/Icons';

const Navbar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Início', icon: HomeIcon },
    { path: '/desafios', label: 'Desafios', icon: TrophyIcon },
    { path: '/carteira', label: 'Carteira', icon: WalletIcon },
    { path: '/perfil', label: 'Perfil', icon: UserCircleIcon },
  ];

  const activeLinkClass = 'text-primary';
  const inactiveLinkClass = 'text-text-secondary hover:text-text';

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-2">
      <div className="container mx-auto max-w-lg bg-glass rounded-full border border-white/10 shadow-lg flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-3 text-xs w-1/4 transition-colors duration-200 ${
                isActive ? activeLinkClass : inactiveLinkClass
              }`
            }
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;