import { useMemo } from 'react';
import {
  Archive,
  Package,
  Clock,
  Trash2,
  BarChart3,
  PieChart,
  TrendingUp,
  Warehouse,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import { ARCHIVE_TYPE_MAP, RETENTION_MAP, type ArchiveType, type RetentionPeriod, type ArchiveStatus } from '@/types';

const ARCHIVE_STATUS_MAP: Record<ArchiveStatus, string> = {
  in_stock: '在库',
  out_reading: '调阅中',
  out_borrowed: '借出',
  inventory: '盘点中',
  destroyed: '已销毁',
  pending_destroy: '待销毁',
};

const ARCHIVE_STATUS_COLORS: Record<ArchiveStatus, string> = {
  in_stock: 'bg-emerald-500',
  out_reading: 'bg-blue-500',
  out_borrowed: 'bg-amber-500',
  inventory: 'bg-purple-500',
  destroyed: 'bg-slate-400',
  pending_destroy: 'bg-red-500',
};

const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#64748b',
];

const BAR_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

function DonutChart({ data, size = 200, thickness = 30 }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let currentAngle = -Math.PI / 2;
  const paths = data.map((d, i) => {
    if (total === 0) return null;
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    return (
      <path
        key={i}
        d={`M ${center} ${center - thickness / 2}
            A ${radius + thickness / 2} ${radius + thickness / 2} 0 ${largeArc} 1 ${x2 + (thickness / 2) * Math.cos(endAngle)} ${y2 + (thickness / 2) * Math.sin(endAngle)}
            L ${x2 + (radius - thickness / 2) * Math.cos(endAngle)} ${y2 + (radius - thickness / 2) * Math.sin(endAngle)}
            A ${radius - thickness / 2} ${radius - thickness / 2} 0 ${largeArc} 0 ${center + (radius - thickness / 2) * Math.cos(startAngle)} ${center + (radius - thickness / 2) * Math.sin(startAngle)}
            Z`}
        fill={d.color}
        className="transition-all duration-300 hover:opacity-80"
      />
    );
  });

  return (
    <svg width={size} height={size} className="mx-auto">
      {paths}
      <text x={center} y={center - 8} textAnchor="middle" fontSize="28" fontWeight="bold" fill="#0f172a">
        {total}
      </text>
      <text x={center} y={center + 14} textAnchor="middle" fontSize="12" fill="#64748b">
        档案总数
      </text>
    </svg>
  );
}

function BarChart({ data, width = 500, height = 220 }: { data: { label: string; value: number; color: string }[]; width?: number; height?: number }) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (chartW / data.length) * 0.6;
  const gap = (chartW / data.length) * 0.4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={padding.top + t * chartH}
            x2={width - padding.right}
            y2={padding.top + t * chartH}
            stroke="#e2e8f0"
            strokeDasharray={i === 4 ? '' : '4 4'}
          />
          <text x={padding.left - 6} y={padding.top + t * chartH + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {Math.round(maxValue * (1 - t))}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * chartH;
        const x = padding.left + i * (barWidth + gap) + gap / 2;
        const y = padding.top + chartH - barHeight;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={d.color}
              rx="4"
              className="transition-all duration-300 hover:opacity-80"
            />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="500" fill="#334155">
              {d.value}
            </text>
            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="11" fill="#64748b">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TrendLineChart({ data, width = 600, height = 220 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartH - ((d.value - minValue) / valueRange) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M${padding.left},${padding.top + chartH} L${points.split(' ').join(' L')} L${padding.left + (data.length - 1) * xStep},${padding.top + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const labels = yTicks.map(t => Math.round(minValue + (1 - t) * valueRange));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
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
              {labels[i]}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#trendGrad)" />
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />

        {data.map((d, i) => {
          const x = padding.left + i * xStep;
          const y = padding.top + chartH - ((d.value - minValue) / valueRange) * chartH;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
              <text x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ArchiveAnalytics() {
  const { archives, warehouses, customers } = useAppStore();

  const totalArchives = archives.length;
  const inStockCount = archives.filter(a => a.status === 'in_stock').length;
  const outReadingCount = archives.filter(a => a.status === 'out_reading').length;
  const pendingDestroyCount = archives.filter(a => a.status === 'pending_destroy').length;

  const typeStats = useMemo(() => {
    const types = Object.keys(ARCHIVE_TYPE_MAP) as ArchiveType[];
    return types.map((type, i) => ({
      type,
      label: ARCHIVE_TYPE_MAP[type],
      value: archives.filter(a => a.type === type).length,
      color: PIE_COLORS[i],
    }));
  }, [archives]);

  const retentionStats = useMemo(() => {
    const periods = Object.keys(RETENTION_MAP) as RetentionPeriod[];
    return periods.map((period, i) => ({
      period,
      label: RETENTION_MAP[period],
      value: archives.filter(a => a.retentionPeriod === period).length,
      color: BAR_COLORS[i],
    }));
  }, [archives]);

  const statusStats = useMemo(() => {
    const statuses = Object.keys(ARCHIVE_STATUS_MAP) as ArchiveStatus[];
    return statuses.map(status => ({
      status,
      label: ARCHIVE_STATUS_MAP[status],
      value: archives.filter(a => a.status === status).length,
      color: ARCHIVE_STATUS_COLORS[status],
    }));
  }, [archives]);

  const warehouseStats = useMemo(() => {
    return warehouses.map(w => ({
      id: w.id,
      name: w.name,
      used: w.usedPositions,
      total: w.totalPositions,
      rate: Math.round((w.usedPositions / w.totalPositions) * 100),
      status: w.status,
    }));
  }, [warehouses]);

  const customerStats = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.archiveCount - a.archiveCount)
      .slice(0, 10)
      .map((c, i) => ({
        id: c.id,
        name: c.name,
        count: c.archiveCount,
        rank: i + 1,
      }));
  }, [customers]);

  const maxCustomerCount = customerStats[0]?.count || 1;

  const trendData = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    return months.map(month => {
      const count = archives.filter(a => a.storageDate.startsWith(month)).length;
      return {
        label: month.slice(5) + '月',
        value: count,
      };
    });
  }, [archives]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">档案统计分析</h1>
          <p className="text-sm text-slate-500 mt-1">多维度档案数据全景分析 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="档案总数"
          value={totalArchives.toLocaleString()}
          subtitle={`含所有登记在册档案`}
          icon={<Archive className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
          trend={{ value: 8.5, label: '较上月' }}
        />
        <StatCard
          title="在库数量"
          value={inStockCount.toLocaleString()}
          subtitle={`占比 ${Math.round((inStockCount / totalArchives) * 100)}%`}
          icon={<Package className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          trend={{ value: 3.2, label: '较上月' }}
        />
        <StatCard
          title="调阅中数量"
          value={outReadingCount.toLocaleString()}
          subtitle={`占比 ${Math.round((outReadingCount / totalArchives) * 100)}%`}
          icon={<Clock className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          trend={{ value: -2.1, label: '较上月' }}
        />
        <StatCard
          title="待销毁数量"
          value={pendingDestroyCount.toLocaleString()}
          subtitle={`占比 ${Math.round((pendingDestroyCount / totalArchives) * 100)}%`}
          icon={<Trash2 className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
          trend={{ value: 1.8, label: '较上月' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary-600" />
              档案类型分布
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <DonutChart data={typeStats.map(t => ({ label: t.label, value: t.value, color: t.color }))} />
            <div className="space-y-2">
              {typeStats.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-slate-700">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{t.value}</span>
                    <span className="text-slate-500 text-xs">
                      ({Math.round((t.value / totalArchives) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              保管期限分布
            </h3>
          </div>
          <BarChart data={retentionStats.map(r => ({ label: r.label, value: r.value, color: r.color }))} />
          <div className="grid grid-cols-5 gap-2 mt-4">
            {retentionStats.map((r, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-bold text-slate-800">{r.value}</div>
                <div className="text-xs text-slate-500">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">档案状态统计</h3>
          </div>
          <div className="space-y-3">
            {statusStats.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    {s.label}
                  </span>
                  <span className="font-medium text-slate-800">{s.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(s.value / totalArchives) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-primary-600" />
              库房容量统计
            </h3>
          </div>
          <div className="space-y-4">
            {warehouseStats.map((w) => {
              const color = w.status === 'full' ? 'bg-red-500' : w.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-700 font-medium truncate" title={w.name}>
                      {w.name.length > 12 ? w.name.slice(0, 12) + '…' : w.name}
                    </span>
                    <span className="text-slate-500 whitespace-nowrap">
                      {w.used}/{w.total} · {w.rate}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${w.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              客户档案量 Top 10
            </h3>
          </div>
          <div className="space-y-3">
            {customerStats.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-medium shrink-0 ${c.rank <= 3 ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {c.rank}
                    </span>
                    <span className="truncate" title={c.name}>
                      {c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name}
                    </span>
                  </span>
                  <span className="text-slate-600 font-medium shrink-0">{c.count} 盒</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    style={{ width: `${(c.count / maxCustomerCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            近6个月档案入库趋势
          </h3>
          <div className="text-xs text-slate-500">
            按月统计新增档案数量
          </div>
        </div>
        <TrendLineChart data={trendData} />
        <div className="grid grid-cols-6 gap-2 mt-4">
          {trendData.map((d, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold text-slate-800">{d.value}</div>
              <div className="text-xs text-slate-500">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
