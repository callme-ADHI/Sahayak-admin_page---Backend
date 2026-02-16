import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Bell,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children?: { to: string; label: string }[];
}

const NavItem = ({ to, icon, label, collapsed, children }: NavItemProps) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(
    children?.some(child => location.pathname.startsWith(child.to)) || location.pathname.startsWith(to)
  );
  const hasChildren = children && children.length > 0;
  const isActive = location.pathname === to || (hasChildren && children.some(c => location.pathname.startsWith(c.to)));

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center w-full px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium border border-transparent',
            isActive
              ? 'bg-slate-100 text-slate-900 border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <span className={cn('min-w-[20px]', isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900 transition-colors')}>{icon}</span>
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left">{label}</span>
              <span className="transition-transform duration-200">
                {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </span>
            </>
          )}
        </button>
        <AnimatePresence>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-9 mt-1 space-y-0.5 border-l border-slate-200 pl-2">
                {children.map(child => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      cn(
                        'block py-1.5 px-3 rounded-md text-xs font-medium transition-colors',
                        isActive
                          ? 'text-slate-900 bg-slate-100 font-semibold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center px-3 py-2 rounded-md mb-0.5 transition-all duration-200 group relative text-sm font-medium border border-transparent',
          isActive
            ? 'bg-slate-100 text-slate-900 border-slate-200 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        )
      }
    >
      <span className={cn('min-w-[20px]', isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900 transition-colors')}>{icon}</span>
      {!collapsed && <span className="ml-3">{label}</span>}
      {collapsed && isActive && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-white text-slate-900 text-xs rounded border border-slate-200 shadow-xl whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </NavLink>
  );
};

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className={cn(
            "flex flex-col transition-opacity duration-300",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Admin<span className="font-light">Suite</span></span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="space-y-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/analytics" icon={<BarChart3 className="w-5 h-5" />} label="Analytics" collapsed={collapsed} />
        </div>

        <div className="space-y-1">
          {!collapsed && <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>}
          <NavItem
            to="/works"
            icon={<Briefcase className="w-5 h-5" />}
            label="Works"
            collapsed={collapsed}
            children={[
              { to: '/works/overview', label: 'All Works' },
              { to: '/works/categories', label: 'Categories' },
              { to: '/works/create', label: 'New Category' },
            ]}
          />
          <NavItem
            to="/profiles"
            icon={<Users className="w-5 h-5" />}
            label="Profiles"
            collapsed={collapsed}
            children={[
              { to: '/profiles/all', label: 'Directory' },
              { to: '/worker-approval', label: 'Approvals' },
            ]}
          />
        </div>

        <div className="space-y-1">
          {!collapsed && <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finance</p>}
          <NavItem to="/payments" icon={<CreditCard className="w-5 h-5" />} label="Payments" collapsed={collapsed} />
          <NavItem to="/reports" icon={<FileText className="w-5 h-5" />} label="Reports" collapsed={collapsed} />
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="space-y-1">
          <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" collapsed={collapsed} />
          <NavItem to="/audit-logs" icon={<Shield className="w-5 h-5" />} label="Audit Logs" collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="mt-6 flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600">
              <span className="text-xs font-bold">JD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
          </div>
        )}
      </div>
    </aside>
  );
};
