import { useMemo } from 'react';
import {
  Archive,
  Warehouse,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Box,
  Clock,
  TrendingDown,
  FileText,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/UI/StatCard';
import LineChart from '@/components/Charts/LineChart';
import { Link } from 'react-router-dom';
import type { Contract, Archive as ArchiveType } from '@/types';

export default function Dashboard() {
  const {
    archives,
    warehouses,
    accessions,
    environmentRecords,
    destructions,
    customers,
    contracts,
  } = useAppStore();

  const inStock = archives.filter((a) => a.status === 'in_stock').length;
  const totalCapacity = warehouses.reduce((acc, w) => acc + w.totalPositions, 0);
  const usedCapacity = warehouses.reduce((acc, w) => acc + w.usedPositions, 0);
  const capacityRate = Math.round((usedCapacity / totalCapacity) * 100);

  const today = new Date().toISOString().slice(0, 10);
  const todayOutbound = accessions.filter((a) => a.items.some((it) => it.outboundTime === today)).length;
  const todayReturned = accessions.filter((a) => a.actualReturnDate === today).length;

  const envAlertsToday = environmentRecords.filter((r) => r.isAbnormal && r.recordDate === today).length;
  const pendingAccessions = accessions.filter((a) => a.status === 'pending').length;
  const pendingDestructions = destructions.filter(
    (d) => d.status === 'pending_customer' || d.status === 'pending_manager',
  ).length;

  const todayPendingApproval = pendingAccessions + pendingDestructions;

  const pendingOutbound = accessions.filter((a) => a.status === 'approved').length;

  const pendingReturn = accessions.filter((a) => a.status === 'outbound' || a.status === 'in_reading').length;

  const nearFullWarehouses = warehouses.filter((w) => {
    const rate = w.usedPositions / w.totalPositions;
    return rate >= 0.85;
  });

  const overdue = accessions.filter((a) => a.status === 'overdue' || (a.status === 'outbound' && a.expectedReturnDate < today));

  const expiringArchives = archives
    .filter((a) => a.status === 'in_stock')
    .filter((a) => {
      const diff = (new Date(a.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 60;
    })
    .slice(0, 5);

  const expiringContracts = contracts
    .filter((c) => c.status === 'active')
    .filter((c) => {
      const diff = (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  const lineData = useMemo(() => {
    const w1Records = environmentRecords
      .filter((r) => r.warehouseId === 'w1')
      .sort((a, b) => a.recordDate.localeCompare(b.recordDate))
      .slice(-30)
      .map((r) => ({ label: r.recordDate, temperature: r.temperature, humidity: r.humidity }));
    return w1Records;
  }, [environmentRecords]);

  const overdueTrendData = useMemo(() => {
    const days = 14;
    const data: { label: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      const count = accessions.filter((a) => {
        if (a.status === 'returned' && a.actualReturnDate) {
          const expected = new Date(a.expectedReturnDate);
          const actual = new Date(a.actualReturnDate);
          return expected < date && actual >= date && actual > expected;
        }
        if (a.status === 'overdue' || (a.status === 'outbound' && a.expectedReturnDate < today)) {
          return new Date(a.expectedReturnDate) <= date;
        }
        return false;
      }).length;

      data.push({ label: dateStr, count });
    }
    return data;
  }, [accessions, today]);

  const topCustomers = [...customers]
    .sort((a, b) => b.archiveCount - a.archiveCount)
    .slice(0, 5);
  const maxCount = topCustomers[0]?.archiveCount || 1;

  const calculateExpectedFullDate = (w: typeof warehouses[0]) => {
    const rate = w.usedPositions / w.totalPositions;
    if (rate >= 1) return '已满';
    const remaining = w.totalPositions - w.usedPositions;
    const dailyGrowth = Math.max(1, Math.floor(w.usedPositions * 0.01));
    const daysToFull = Math.ceil(remaining / dailyGrowth);
    const fullDate = new Date();
    fullDate.setDate(fullDate.getDate() + daysToFull);
    return fullDate.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">数据看板</h1>
          <p className="text-sm text-slate-500 mt-1">档案寄存中心运营概览 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="今日待审批"
          value={todayPendingApproval}
          subtitle={`调阅待审 ${pendingAccessions} · 销毁待批 ${pendingDestructions}`}
          icon={<Clock className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
        />
        <StatCard
          title="待出库数量"
          value={pendingOutbound}
          subtitle="已审批待出库调阅"
          icon={<Package className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-cyan-600 to-cyan-800"
        />
        <StatCard
          title="待归还数量"
          value={pendingReturn}
          subtitle="调阅中未归还档案"
          icon={<ArrowRightLeft className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-orange-600 to-orange-800"
        />
        <StatCard
          title="即将满架库房"
          value={nearFullWarehouses.length}
          subtitle={`使用率 >= 85%`}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="在库档案盒数"
          value={inStock.toLocaleString()}
          subtitle={`共 ${archives.length} 盒登记在册`}
          icon={<Archive className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
          trend={{ value: 5.2, label: '较上月' }}
        />
        <StatCard
          title="库房容量使用率"
          value={`${capacityRate}%`}
          subtitle={`${usedCapacity.toLocaleString()} / ${totalCapacity.toLocaleString()} 架位`}
          icon={<Warehouse className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          trend={{ value: 2.1, label: '较上月' }}
        />
        <StatCard
          title="今日调阅出入库"
          value={
            <div className="flex items-baseline gap-2">
              <span>{todayOutbound}</span>
              <span className="text-lg opacity-70">出</span>
              <span className="mx-1 opacity-60">/</span>
              <span>{todayReturned}</span>
              <span className="text-lg opacity-70">还</span>
            </div>
          }
          subtitle={`本月累计 ${accessions.length} 次调阅`}
          icon={<ArrowRightLeft className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
        />
        <StatCard
          title="待处理告警"
          value={envAlertsToday + pendingAccessions + pendingDestructions}
          subtitle={`环境告警 ${envAlertsToday} · 调阅待审 ${pendingAccessions} · 销毁待批 ${pendingDestructions}`}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
        />
      </div>

      {nearFullWarehouses.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="section-title">即将满架库房提醒</h3>
            </div>
            <Link to="/warehouses" className="text-xs text-primary-600 hover:underline">查看全部库房 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearFullWarehouses.map((w) => {
              const rate = Math.round((w.usedPositions / w.totalPositions) * 100);
              const color = rate >= 100 ? 'bg-red-500' : rate >= 95 ? 'bg-orange-500' : 'bg-amber-500';
              const expectedFullDate = calculateExpectedFullDate(w);
              return (
                <div key={w.id} className="p-4 rounded-lg border border-amber-100 bg-amber-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{w.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rate >= 100 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {rate}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(rate, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{w.usedPositions}/{w.totalPositions} 架位</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      预计满架: {expectedFullDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              <h3 className="section-title">即将到期合同（30天内）</h3>
            </div>
            <span className="badge badge-primary">{expiringContracts.length} 份</span>
          </div>
          <div className="space-y-3">
            {expiringContracts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无即将到期合同</p>
            ) : (
              expiringContracts.map((c: Contract) => {
                const remainingDays = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-md bg-primary-50 border border-primary-100">
                    <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{c.customerName}</div>
                      <div className="text-xs text-slate-500 truncate">{c.contractNo}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">{c.endDate}</div>
                      <div className={`text-xs font-medium ${remainingDays <= 7 ? 'text-red-600' : 'text-primary-600'}`}>
                        剩余 {remainingDays} 天
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-500" />
              <h3 className="section-title">即将到期档案（60天内）</h3>
            </div>
            <span className="badge badge-warning">{expiringArchives.length} 盒</span>
          </div>
          <div className="space-y-3">
            {expiringArchives.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无即将到期档案</p>
            ) : (
              expiringArchives.map((a: ArchiveType) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md bg-amber-50 border border-amber-100">
                  <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                    <Box className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                    <div className="text-xs text-slate-500 truncate">{a.boxNo} · {a.customerName}</div>
                  </div>
                  <div className="text-xs text-amber-700 font-medium shrink-0">
                    {a.expiryDate.slice(5)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            <h3 className="section-title">逾期未归还趋势（近14天）</h3>
          </div>
          <div className="text-xs text-slate-500">
            当日逾期调阅数量统计
          </div>
        </div>
        <OverdueTrendChart data={overdueTrendData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">一号库房温湿度趋势（近30天）</h3>
            <div className="text-xs text-slate-500">
              标准: 14-24℃ / 45-60%RH
            </div>
          </div>
          <LineChart data={lineData} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">库房容量概览</h3>
            <Link to="/warehouses" className="text-xs text-primary-600 hover:underline">查看详情 →</Link>
          </div>
          <div className="space-y-4">
            {warehouses.map((w) => {
              const rate = Math.round((w.usedPositions / w.totalPositions) * 100);
              const color = w.status === 'full' ? 'bg-red-500' : w.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-700 font-medium">{w.name}</span>
                    <span className="text-slate-500">{w.usedPositions}/{w.totalPositions} · {rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">逾期未还档案</h3>
            <span className="badge badge-danger">{overdue.length} 笔</span>
          </div>
          <div className="space-y-3">
            {overdue.slice(0, 5).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无逾期档案</p>
            ) : (
              overdue.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md bg-red-50 border border-red-100">
                  <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center shrink-0">
                    <Box className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.accessionNo}</div>
                    <div className="text-xs text-slate-500 truncate">{a.customerName}</div>
                  </div>
                  <div className="text-xs text-red-600 font-medium shrink-0">
                    超期 {Math.ceil((Date.now() - new Date(a.expectedReturnDate).getTime()) / 86400000)} 天
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">即将到期需续存/销毁</h3>
            <span className="badge badge-warning">{expiringArchives.length} 盒</span>
          </div>
          <div className="space-y-3">
            {expiringArchives.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                  <div className="text-xs text-slate-500 truncate">{a.boxNo} · {a.customerName}</div>
                </div>
                <div className="text-xs text-amber-700 font-medium shrink-0">
                  {Math.ceil((new Date(a.expiryDate).getTime() - Date.now()) / 86400000)} 天后
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">客户寄存量 Top 5</h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3.5">
            {topCustomers.map((c, idx) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-medium ${idx < 3 ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    {c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name}
                  </span>
                  <span className="text-slate-600 font-medium">{c.archiveCount} 盒</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    style={{ width: `${(c.archiveCount / maxCount) * 100}%` }}
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

interface OverdueTrendChartProps {
  data: { label: string; count: number }[];
  width?: number;
  height?: number;
}

function OverdueTrendChart({ data, width = 800, height = 220 }: OverdueTrendChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const minVal = 0;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + ((maxVal - d.count) / (maxVal - minVal)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M${padding.left},${padding.top + chartH} L${points.split(' ').join(' L')} L${padding.left + (data.length - 1) * xStep},${padding.top + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const yLabels = yTicks.map((t) => Math.round(maxVal - t * (maxVal - minVal)));

  const displayLabels = data.filter((_, i) => i % 2 === 0 || i === data.length - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
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
              {yLabels[i]}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#overdueGrad)" />
        <polyline points={points} fill="none" stroke="#f43f5e" strokeWidth="2" />

        {data.map((d, i) => {
          const x = padding.left + i * xStep;
          const y = padding.top + ((maxVal - d.count) / (maxVal - minVal)) * chartH;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#fff" stroke="#f43f5e" strokeWidth="2" />
              {d.count > 0 && (
                <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#f43f5e" fontWeight="500">
                  {d.count}
                </text>
              )}
            </g>
          );
        })}

        {displayLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={i}
              x={padding.left + idx * xStep}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
              transform={`rotate(-30 ${padding.left + idx * xStep} ${height - 10})`}
            >
              {d.label.slice(5)}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-600">逾期调阅数量（笔）</span>
        </div>
      </div>
    </div>
  );
}
