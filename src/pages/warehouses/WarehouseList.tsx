import { Link } from 'react-router-dom';
import { Warehouse as WarehouseIcon, Thermometer, Droplets, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const typeMap: Record<string, { label: string; cls: string }> = {
  paper: { label: '纸质档案', cls: 'badge-primary' },
  film: { label: '胶片档案', cls: 'badge-accent' },
  mixed: { label: '综合档案', cls: 'badge-slate' },
};

const statusMap: Record<string, { label: string; dot: string; ring: string }> = {
  normal: { label: '正常', dot: 'bg-emerald-500', ring: 'bg-emerald-100' },
  warning: { label: '容量预警', dot: 'bg-amber-500', ring: 'bg-amber-100' },
  full: { label: '已满', dot: 'bg-red-500', ring: 'bg-red-100' },
};

export default function WarehouseList() {
  const { warehouses, environmentRecords } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">库房管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {warehouses.length} 个库房，实时监控架位与环境状况</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {warehouses.map((w) => {
          const rate = Math.round((w.usedPositions / w.totalPositions) * 100);
          const todayEnv = environmentRecords.find((r) => r.warehouseId === w.id && r.recordDate === today);
          const abnormalCount = environmentRecords.filter((r) => r.warehouseId === w.id && r.isAbnormal).length;
          const barColor = w.status === 'full' ? 'from-red-400 to-red-600' : w.status === 'warning' ? 'from-amber-400 to-amber-600' : 'from-emerald-400 to-emerald-600';

          return (
            <div key={w.id} className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <WarehouseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-serif">{w.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono">{w.code}</span>
                      <span className={cn('badge', typeMap[w.archiveType]?.cls)}>{typeMap[w.archiveType]?.label}</span>
                    </div>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full', statusMap[w.status]?.ring)}>
                  <span className={cn('w-2 h-2 rounded-full animate-pulse', statusMap[w.status]?.dot)} />
                  <span className="text-xs font-medium text-slate-700">{statusMap[w.status]?.label}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">架位使用率</span>
                    <span className="font-semibold text-slate-800">{w.usedPositions} / {w.totalPositions} <span className="text-slate-400 font-normal">({rate}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-700', barColor)}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-0.5">总列数</div>
                    <div className="text-lg font-semibold text-slate-800">{w.columns}</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-0.5">面/列</div>
                    <div className="text-lg font-semibold text-slate-800">{w.sidesPerColumn}</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-0.5">层/面</div>
                    <div className="text-lg font-semibold text-slate-800">{w.levelsPerSide}</div>
                  </div>
                </div>

                {todayEnv && (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-700 font-medium">{todayEnv.temperature}℃</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-700 font-medium">{todayEnv.humidity}%RH</span>
                    </div>
                    {abnormalCount > 0 && (
                      <div className="ml-auto flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">本月{abnormalCount}次异常</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link to={`/warehouses/${w.id}`} className="btn-secondary btn-sm flex-1">
                  架位详情
                </Link>
                <Link to={`/warehouses/${w.id}/environment`} className="btn-ghost btn-sm flex-1">
                  温湿度 <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
