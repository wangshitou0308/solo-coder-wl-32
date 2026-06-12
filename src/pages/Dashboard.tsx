import { useMemo } from 'react';
import {
  Archive,
  Warehouse,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Box,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/UI/StatCard';
import LineChart from '@/components/Charts/LineChart';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    archives,
    warehouses,
    accessions,
    environmentRecords,
    destructions,
    customers,
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

  const overdue = accessions.filter((a) => a.status === 'overdue' || (a.status === 'outbound' && a.expectedReturnDate < today));

  const expiringArchives = archives
    .filter((a) => a.status === 'in_stock')
    .filter((a) => {
      const diff = (new Date(a.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 60;
    })
    .slice(0, 5);

  const lineData = useMemo(() => {
    const w1Records = environmentRecords
      .filter((r) => r.warehouseId === 'w1')
      .sort((a, b) => a.recordDate.localeCompare(b.recordDate))
      .slice(-30)
      .map((r) => ({ label: r.recordDate, temperature: r.temperature, humidity: r.humidity }));
    return w1Records;
  }, [environmentRecords]);

  const topCustomers = [...customers]
    .sort((a, b) => b.archiveCount - a.archiveCount)
    .slice(0, 5);
  const maxCount = topCustomers[0]?.archiveCount || 1;

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
