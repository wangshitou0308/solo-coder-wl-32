import { Link } from 'react-router-dom';
import { Plus, ClipboardList, CheckCircle, AlertCircle, MoveHorizontal, XCircle, Play, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待开始', cls: 'badge-slate' },
  in_progress: { label: '进行中', cls: 'badge-primary' },
  completed: { label: '已完成', cls: 'badge-success' },
};

const typeMap: Record<string, string> = {
  by_warehouse: '按库房',
  by_customer: '按客户',
  by_position: '按架位',
};

export default function InventoryList() {
  const { inventoryTasks } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">盘点管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {inventoryTasks.length} 个盘点任务</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          创建盘点任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {inventoryTasks.map((t) => {
          const progress = t.totalCount > 0 ? Math.round((t.checkedCount / t.totalCount) * 100) : 0;
          const circumference = 2 * Math.PI * 32;
          const offset = circumference - (progress / 100) * circumference;
          return (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-serif">{t.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{t.taskNo}</div>
                  </div>
                </div>
                <span className={cn('badge', statusMap[t.status]?.cls)}>{statusMap[t.status]?.label}</span>
              </div>

              <div className="flex items-center gap-5 mb-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={t.status === 'completed' ? '#10b981' : '#1e3a5f'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-slate-800">{progress}%</div>
                    <div className="text-[10px] text-slate-500">完成</div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>正常 <strong className="text-slate-800">{t.normalCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>缺失 <strong className="text-slate-800">{t.missingCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>错位 <strong className="text-slate-800">{t.misplacedCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>破损 <strong className="text-slate-800">{t.damagedCount}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{typeMap[t.type]}</span>
                  <span>· 共 {t.totalCount} 盒</span>
                </div>
                <div>创建时间：{t.createdAt}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {t.status !== 'completed' ? (
                  <Link to={`/inventory/${t.id}`} className="btn btn-sm btn-primary flex-1 justify-center">
                    {t.status === 'pending' ? <><Play className="w-3.5 h-3.5" /> 开始盘点</> : <>继续盘点</>}
                  </Link>
                ) : (
                  <button className="btn btn-sm btn-secondary flex-1 justify-center">
                    查看差异报告
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
