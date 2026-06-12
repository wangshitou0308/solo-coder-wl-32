import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, MoveHorizontal, ScanLine, Save } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { InventoryStatus } from '@/types';

const statusConfig: Record<InventoryStatus, { label: string; icon: any; cls: string; btn: string }> = {
  pending: { label: '待盘点', icon: ScanLine, cls: 'badge-slate', btn: 'btn-secondary' },
  normal: { label: '在位正常', icon: CheckCircle, cls: 'badge-success', btn: 'btn-success' },
  missing: { label: '缺失', icon: XCircle, cls: 'badge-danger', btn: 'btn-danger' },
  misplaced: { label: '错位', icon: MoveHorizontal, cls: 'badge-warning', btn: 'btn-warning' },
  damaged: { label: '破损', icon: AlertTriangle, cls: 'badge-danger', btn: 'btn-accent' },
};

export default function InventoryExecute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventoryTasks, updateInventoryItem, completeInventoryTask } = useAppStore();
  const task = inventoryTasks.find((t) => t.id === id);
  const [filter, setFilter] = useState<'all' | InventoryStatus>('all');

  if (!task) {
    return <div>任务不存在</div>;
  }

  const filtered = task.items.filter((it) => filter === 'all' || it.status === filter);
  const progress = task.totalCount > 0 ? Math.round((task.checkedCount / task.totalCount) * 100) : 0;

  const handleStatus = (itemId: string, status: InventoryStatus) => {
    updateInventoryItem(task.id, itemId, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventory" className="btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-serif">{task.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              任务编号 <span className="font-mono">{task.taskNo}</span> · 进度 {task.checkedCount}/{task.totalCount} ({progress}%)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {task.status !== 'completed' && (
            <button
              className="btn btn-primary"
              onClick={() => { completeInventoryTask(task.id); navigate('/inventory'); }}
              disabled={task.checkedCount === 0}
            >
              <Save className="w-4 h-4" />
              完成盘点
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['all', 'pending', 'normal', 'missing', 'misplaced'] as const).map((s) => {
          const count = s === 'all' ? task.items.length : task.items.filter((i) => i.status === s).length;
          const Config = s === 'all' ? null : statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'p-3 rounded-lg border transition-all text-left',
                filter === s ? 'bg-primary-50 border-primary-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300',
              )}
            >
              <div className="text-xs text-slate-500">
                {s === 'all' ? '全部' : Config?.label}
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">档案信息</th>
                <th className="table-th">期望架位</th>
                <th className="table-th">实际架位</th>
                <th className="table-th">盘点状态</th>
                <th className="table-th">标记状态</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const Config = statusConfig[it.status];
                const Icon = Config.icon;
                return (
                  <tr key={it.id} className={cn(it.status !== 'pending' && 'bg-slate-50/50')}>
                    <td className="table-td">
                      <div className="font-medium text-slate-800">{it.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{it.barcode}</div>
                    </td>
                    <td className="table-td font-mono text-xs text-slate-600">{it.expectedPosition}</td>
                    <td className="table-td font-mono text-xs">
                      {it.actualPosition ? <span className="text-primary-600">{it.actualPosition}</span> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="table-td">
                      <span className={cn('badge', Config.cls)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {Config.label}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => handleStatus(it.id, 'normal')}
                          className={cn('btn btn-xs', it.status === 'normal' ? 'bg-emerald-600 text-white border-emerald-600' : 'btn-secondary')}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <CheckCircle className="w-3 h-3" /> 正常
                        </button>
                        <button
                          onClick={() => handleStatus(it.id, 'missing')}
                          className={cn('btn btn-xs', it.status === 'missing' ? 'bg-red-600 text-white border-red-600' : 'btn-secondary')}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <XCircle className="w-3 h-3" /> 缺失
                        </button>
                        <button
                          onClick={() => handleStatus(it.id, 'misplaced')}
                          className={cn('btn btn-xs', it.status === 'misplaced' ? 'bg-amber-500 text-white border-amber-500' : 'btn-secondary')}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <MoveHorizontal className="w-3 h-3" /> 错位
                        </button>
                        <button
                          onClick={() => handleStatus(it.id, 'damaged')}
                          className={cn('btn btn-xs', it.status === 'damaged' ? 'bg-orange-500 text-white border-orange-500' : 'btn-secondary')}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <AlertTriangle className="w-3 h-3" /> 破损
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
