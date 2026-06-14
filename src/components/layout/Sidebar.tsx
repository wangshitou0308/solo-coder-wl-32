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
  Settings,
  DollarSign,
  BarChart3,
  Download,
  TrendingUp,
  PieChart,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: '运营概览',
    items: [
      { to: '/', label: '数据看板', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: '档案管理',
    items: [
      { to: '/archives', label: '档案入库', icon: Archive },
      { to: '/warehouses', label: '库房管理', icon: Warehouse },
      { to: '/accessions', label: '调阅服务', icon: FileSearch },
      { to: '/inventory', label: '盘点管理', icon: ClipboardList },
      { to: '/destruction', label: '销毁管理', icon: Trash2 },
    ],
  },
  {
    label: '合同与客户',
    items: [
      { to: '/contracts', label: '合同管理', icon: FileText },
      { to: '/customers', label: '客户管理', icon: Users },
    ],
  },
  {
    label: '计费管理',
    items: [
      { to: '/billing/fee-standards', label: '费用标准', icon: Settings },
      { to: '/billing', label: '账单管理', icon: Receipt },
      { to: '/billing/receivables', label: '应收账款', icon: DollarSign },
    ],
  },
  {
    label: '数据分析',
    items: [
      { to: '/analytics/customers', label: '客户分析', icon: TrendingUp },
      { to: '/analytics/archives', label: '档案分析', icon: PieChart },
      { to: '/analytics/warehouses', label: '库房分析', icon: Package },
    ],
  },
  {
    label: '系统工具',
    items: [
      { to: '/export', label: '导出中心', icon: Download },
    ],
  },
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

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-3">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && group.label && (
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-primary-300 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
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
          </div>
        ))}
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
