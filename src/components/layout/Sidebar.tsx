import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Archive,
  Warehouse,
  FileSearch,
  ClipboardList,
  Trash2,
  FileText,
  Receipt,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '数据看板', icon: LayoutDashboard, exact: true },
  { to: '/archives', label: '档案入库', icon: Archive },
  { to: '/warehouses', label: '库房管理', icon: Warehouse },
  { to: '/accessions', label: '调阅服务', icon: FileSearch },
  { to: '/inventory', label: '盘点管理', icon: ClipboardList },
  { to: '/destruction', label: '销毁管理', icon: Trash2 },
  { to: '/contracts', label: '合同管理', icon: FileText },
  { to: '/billing', label: '账单管理', icon: Receipt },
  { to: '/customers', label: '客户管理', icon: Users },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-primary-600 flex flex-col transition-all duration-300 border-r border-primary-700',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-primary-700/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-accent-500 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold font-serif text-sm leading-tight">档案馆寄存中心</span>
              <span className="text-primary-300 text-[10px] leading-tight">Archive Management</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'sidebar-link',
                isActive && 'sidebar-link-active',
                collapsed && 'justify-center px-2',
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-primary-700/50 p-2">
        <div className={cn('flex items-center gap-3 p-2 rounded-md hover:bg-primary-700/50 transition-colors', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-accent-500/80 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">管</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">管理员</div>
              <div className="text-xs text-primary-300 truncate">系统管理</div>
            </div>
          )}
          {!collapsed && <button className="text-primary-300 hover:text-white transition-colors" title="退出登录">
            <LogOut className="w-4 h-4" />
          </button>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2 flex items-center justify-center py-1.5 rounded-md text-primary-300 hover:text-white hover:bg-primary-700/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
