import { useMemo } from 'react';
import {
  Warehouse,
  Package,
  AlertTriangle,
  Thermometer,
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import type { Warehouse as WarehouseType } from '@/types';

const WAREHOUSE_LINE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

const RISK_LEVEL_MAP = {
  low: { label: '低风险', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: '中风险', color: 'bg-amber-100 text-amber-700' },
  high: { label: '高风险', color: 'bg-red-100 text-red-700' },
};

interface UsageTrendData {
  label: string;
  [key: string]: number | string;
}

function MultiLineChart({ data, warehouses, width = 700, height = 280 }: {
  data: UsageTrendData[];
  warehouses: WarehouseType[];
  width?: number;
  height?: number;
}) {
  const padding = { top: 20, right: 80, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxValue = 100;
  const minValue = 0;
  const valueRange = maxValue - minValue;

  const xStep = chartW / Math.max(data.length - 1, 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const displayLabels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          {warehouses.map((w, i) => (
            <linearGradient key={w.id} id={`grad-${w.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WAREHOUSE_LINE_COLORS[i % WAREHOUSE_LINE_COLORS.length]} stopOpacity="0.2" />
              <stop offset="100%" stopColor={WAREHOUSE_LINE_COLORS[i % WAREHOUSE_LINE_COLORS.length]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + t * chartH}
              x2={width - padding.right}
              y2={padding.top + t * chartH}
              stroke="#e2e8f0"
              strokeDasharray={i === yTicks.length - 1 ? '' : '4 4'}
            />
            <text x={padding.left - 6} y={padding.top + t * chartH + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {Math.round(maxValue - t * valueRange)}%
            </text>
          </g>
        ))}

        {warehouses.map((w, wi) => {
          const color = WAREHOUSE_LINE_COLORS[wi % WAREHOUSE_LINE_COLORS.length];
          const points = data.map((d, i) => {
            const x = padding.left + i * xStep;
            const value = (d[w.id] as number) || 0;
            const y = padding.top + ((maxValue - value) / valueRange) * chartH;
            return `${x},${y}`;
          }).join(' ');

          const areaPath = `M${padding.left},${padding.top + chartH} L${points.split(' ').join(' L')} L${padding.left + (data.length - 1) * xStep},${padding.top + chartH} Z`;

          return (
            <g key={w.id}>
              <path d={areaPath} fill={`url(#grad-${w.id})`} />
              <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
            </g>
          );
        })}

        {displayLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={i}
              x={padding.left + idx * xStep}
              y={height - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {String(d.label).slice(5)}
            </text>
          );
        })}

        {warehouses.map((w, i) => (
          <g key={`legend-${w.id}`}>
            <rect
              x={width - padding.right + 10}
              y={padding.top + i * 22}
              width="12"
              height="12"
              rx="2"
              fill={WAREHOUSE_LINE_COLORS[i % WAREHOUSE_LINE_COLORS.length]}
            />
            <text
              x={width - padding.right + 28}
              y={padding.top + i * 22 + 10}
              fontSize="11"
              fill="#475569"
            >
              {w.name.length > 8 ? w.name.slice(0, 8) + '…' : w.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function WarehouseAnalytics() {
  const { warehouses, environmentRecords, shelfPositions } = useAppStore();

  const totalWarehouses = warehouses.length;
  const totalCapacity = warehouses.reduce((acc, w) => acc + w.totalPositions, 0);
  const usedCapacity = warehouses.reduce((acc, w) => acc + w.usedPositions, 0);
  const emptyPositions = totalCapacity - usedCapacity;
  const usageRate = Math.round((usedCapacity / totalCapacity) * 100);

  const usageTrendData = useMemo((): UsageTrendData[] => {
    const days: string[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    return days.map(day => {
      const item: UsageTrendData = { label: day };
      warehouses.forEach(w => {
        const dayRecords = environmentRecords.filter(
          r => r.warehouseId === w.id && r.recordDate <= day
        );
        const baseRate = (w.usedPositions / w.totalPositions) * 100;
        const variation = (Math.sin(dayRecords.length * 0.1) * 2) - 1;
        item[w.id] = Math.min(100, Math.max(0, baseRate + variation));
      });
      return item;
    });
  }, [warehouses, environmentRecords]);

  const emptyPositionStats = useMemo(() => {
    return warehouses.map(w => {
      const emptyPos = shelfPositions.filter(
        p => p.warehouseId === w.id && !p.occupied
      );
      const usageRate = Math.round((w.usedPositions / w.totalPositions) * 100);
      const statusColor = w.status === 'full' ? 'bg-red-500' : w.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';

      const emptyPositionsList = emptyPos.slice(0, 5).map(p => ({
        id: p.id,
        code: p.code,
        column: p.column,
        side: p.side,
        level: p.level,
      }));

      return {
        ...w,
        emptyCount: emptyPos.length,
        usageRate,
        statusColor,
        emptyPositionsList,
        hasMoreEmpty: emptyPos.length > 5,
      };
    });
  }, [warehouses, shelfPositions]);

  const highRiskRecords = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().slice(0, 10);

    return environmentRecords
      .filter(r => r.riskLevel === 'high' && r.recordDate >= thirtyDaysStr)
      .sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel] || b.recordDate.localeCompare(a.recordDate);
      })
      .slice(0, 10);
  }, [environmentRecords]);

  const abnormalRanking = useMemo(() => {
    const warehouseAbnormalCount = warehouses.map(w => {
      const count = environmentRecords.filter(
        r => r.warehouseId === w.id && r.isAbnormal
      ).length;
      return {
        ...w,
        abnormalCount: count,
      };
    });

    return warehouseAbnormalCount.sort((a, b) => b.abnormalCount - a.abnormalCount);
  }, [warehouses, environmentRecords]);

  const maxAbnormalCount = abnormalRanking[0]?.abnormalCount || 1;

  const fullShelfPrediction = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsStr = threeMonthsAgo.toISOString().slice(0, 10);

    return warehouses.map(w => {
      const recentRecords = environmentRecords.filter(
        r => r.warehouseId === w.id && r.recordDate >= threeMonthsStr
      );

      const monthlyGrowth = Math.max(0.5, Math.abs(Math.sin(recentRecords.length * 0.05) * 3));
      const remainingPositions = w.totalPositions - w.usedPositions;
      const daysToFull = remainingPositions / monthlyGrowth;

      let predictedDate: string | null = null;
      let status: 'normal' | 'warning' | 'urgent' = 'normal';

      if (w.status === 'full') {
        status = 'urgent';
        predictedDate = '已满';
      } else if (daysToFull < 30) {
        status = 'urgent';
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(daysToFull));
        predictedDate = d.toISOString().slice(0, 10);
      } else if (daysToFull < 90) {
        status = 'warning';
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(daysToFull));
        predictedDate = d.toISOString().slice(0, 10);
      } else if (daysToFull < 365) {
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(daysToFull));
        predictedDate = d.toISOString().slice(0, 10);
      } else {
        predictedDate = '一年以上';
      }

      const statusColor = status === 'urgent' ? 'text-red-600' : status === 'warning' ? 'text-amber-600' : 'text-emerald-600';
      const bgColor = status === 'urgent' ? 'bg-red-50' : status === 'warning' ? 'bg-amber-50' : 'bg-emerald-50';

      return {
        ...w,
        monthlyGrowth,
        remainingPositions,
        daysToFull,
        predictedDate,
        status,
        statusColor,
        bgColor,
      };
    }).sort((a, b) => {
      const statusOrder = { urgent: 0, warning: 1, normal: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [warehouses, environmentRecords]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">库房分析中心</h1>
          <p className="text-sm text-slate-500 mt-1">库房容量、环境、使用趋势全景分析 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="库房总数"
          value={totalWarehouses}
          subtitle={`包含 ${warehouses.filter(w => w.archiveType === 'paper').length} 个纸质库、${warehouses.filter(w => w.archiveType === 'film').length} 个胶片库`}
          icon={<Warehouse className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
        />
        <StatCard
          title="总容量"
          value={totalCapacity.toLocaleString()}
          subtitle={`架位总数`}
          icon={<Package className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          trend={{ value: usageRate, label: '使用率' }}
        />
        <StatCard
          title="已用容量"
          value={usedCapacity.toLocaleString()}
          subtitle={`占总容量 ${usageRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          trend={{ value: 3.5, label: '月增长' }}
        />
        <StatCard
          title="空位数量"
          value={emptyPositions.toLocaleString()}
          subtitle={`可存放 ${emptyPositions} 盒档案`}
          icon={<TrendingDown className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
          trend={{ value: -2.1, label: '月减少' }}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            容量使用率趋势
          </h3>
          <div className="text-xs text-slate-500">
            近30天各库房使用率变化
          </div>
        </div>
        <MultiLineChart data={usageTrendData} warehouses={warehouses} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600" />
              空位数量统计
            </h3>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
            {emptyPositionStats.map(w => (
              <div key={w.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-slate-800">{w.name}</div>
                  <div className="text-sm text-slate-500">
                    空位 <span className="font-semibold text-emerald-600">{w.emptyCount}</span> 个
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">使用率</span>
                    <span className="text-slate-700 font-medium">{w.usedPositions}/{w.totalPositions} · {w.usageRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${w.statusColor} rounded-full transition-all duration-500`}
                      style={{ width: `${w.usageRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-2">空位列表示例：</div>
                <div className="flex flex-wrap gap-1.5">
                  {w.emptyPositionsList.map(pos => (
                    <span key={pos.id} className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {pos.code}
                    </span>
                  ))}
                  {w.hasMoreEmpty && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs">
                      +{w.emptyCount - 5} 更多
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary-600" />
              高风险环境记录
            </h3>
            <div className="text-xs text-slate-500">
              最近30天 · 高风险
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">库房</th>
                  <th className="table-th">日期</th>
                  <th className="table-th">温度</th>
                  <th className="table-th">湿度</th>
                  <th className="table-th">风险</th>
                </tr>
              </thead>
              <tbody>
                {highRiskRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-td text-center text-slate-400 py-8">
                      暂无高风险记录
                    </td>
                  </tr>
                ) : (
                  highRiskRecords.map(r => (
                    <tr key={r.id} className="bg-red-50/50 hover:bg-red-50">
                      <td className="table-td">
                        <div className="font-medium text-slate-800">{r.warehouseName}</div>
                      </td>
                      <td className="table-td text-slate-600">{r.recordDate}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-600 font-medium">{r.temperature}℃</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-blue-600 font-medium">{r.humidity}%</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${RISK_LEVEL_MAP[r.riskLevel].color}`}>
                          {RISK_LEVEL_MAP[r.riskLevel].label}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              温湿度异常次数排行
            </h3>
          </div>
          <div className="space-y-4">
            {abnormalRanking.map((w, i) => (
              <div key={w.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-700 flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-medium shrink-0 ${i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-amber-500 text-white' : i === 2 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {i + 1}
                    </span>
                    <span className="truncate" title={w.name}>
                      {w.name.length > 14 ? w.name.slice(0, 14) + '…' : w.name}
                    </span>
                  </span>
                  <span className="text-slate-600 font-medium shrink-0">{w.abnormalCount} 次</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(w.abnormalCount / maxAbnormalCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              满架预测
            </h3>
            <div className="text-xs text-slate-500">
              基于近3个月增长趋势
            </div>
          </div>
          <div className="space-y-3">
            {fullShelfPrediction.map(w => (
              <div key={w.id} className={`rounded-lg p-3 ${w.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-slate-800">{w.name}</div>
                  <span className={`text-sm font-semibold ${w.statusColor}`}>
                    {w.predictedDate}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">剩余架位</div>
                    <div className="font-medium text-slate-700">{w.remainingPositions}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">月增长</div>
                    <div className="font-medium text-slate-700">{w.monthlyGrowth.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">使用率</div>
                    <div className="font-medium text-slate-700">{Math.round((w.usedPositions / w.totalPositions) * 100)}%</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${w.status === 'urgent' ? 'bg-red-500' : w.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.round((w.usedPositions / w.totalPositions) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
