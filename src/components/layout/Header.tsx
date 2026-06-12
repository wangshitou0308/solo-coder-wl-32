import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAppStore } from '@/store';

const routeMap: Record<string, string> = {
  '/': '数据看板',
  '/archives': '档案入库',
  '/warehouses': '库房管理',
  '/accessions': '调阅服务',
  '/inventory': '盘点管理',
  '/destruction': '销毁管理',
  '/contracts': '合同管理',
  '/billing': '账单管理',
  '/customers': '客户管理',
};

export default function Header() {
  const location = useLocation();
  const currentTitle = routeMap[location.pathname] || '系统';
  const pendingAccessions = useAppStore((s) => s.accessions.filter((a) => a.status === 'pending').length);
  const pendingDestructions = useAppStore((s) => s.destructions.filter((d) => d.status === 'pending_customer' || d.status === 'pending_manager').length);
  const envAlerts = useAppStore((s) => s.environmentRecords.filter((r) => r.isAbnormal && r.recordDate === new Date().toISOString().slice(0, 10)).length);
  const totalAlerts = pendingAccessions + pendingDestructions + envAlerts;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">档案馆寄存中心</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium font-serif">{currentTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索档案号、客户、条码..."
            className="w-72 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
          />
        </div>

        <button className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          {totalAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {totalAlerts}
            </span>
          )}
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
          管
        </div>
      </div>
    </header>
  );
}
