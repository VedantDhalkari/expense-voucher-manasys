import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Receipt, FileText, CheckSquare, List } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC<{ isOpen: boolean; close: () => void }> = ({ isOpen, close }) => {
  const { user } = useAuth();

  const routes = {
    EMPLOYEE: [
      { path: '/employee', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/employee/vouchers', label: 'My Vouchers', icon: Receipt },
      { path: '/employee/vouchers/new', label: 'New Voucher', icon: FileText },
    ],
    DIRECTOR: [
      { path: '/director', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/director/pending-approvals', label: 'Pending Approvals', icon: CheckSquare },
      { path: '/director/vouchers', label: 'All Vouchers', icon: List },
    ],
    ACCOUNTS: [
      { path: '/accounts', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/accounts/vouchers', label: 'All Vouchers', icon: List },
    ],
  };

  const navItems = user ? routes[user.role] : [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-navy/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}
      
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[264px] bg-brand-subSurface border-r border-brand-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 font-heading font-bold text-xl text-brand-navy border-b border-brand-border">
          ExpenseFlow
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => close()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-action/10 text-brand-action"
                    : "text-brand-slate hover:bg-brand-border/50 hover:text-brand-navy"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
