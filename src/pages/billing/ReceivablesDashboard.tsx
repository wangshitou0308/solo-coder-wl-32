import { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Receipt,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import { BILL_STATUS_MAP } from '@/types';
import { cn } from '@/lib/utils';

export default function ReceivablesDashboard() {
  const { bills, customers, paymentRecords } = useAppStore();

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthBills = bills.filter((b) => b.period === currentMonth);
  const monthlyReceivable = currentMonthBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const monthlyPaid = currentMonthBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const monthlyUnpaid = monthlyReceivable - monthlyPaid;

  const overdueBills = bills.filter((b) => {
    if (b.status === 'paid') return false;
    const dueDate = new Date(b.dueDate);
    return dueDate < today;
  });

  const overdueAmount = overdueBills.reduce((acc, b) => acc + (b.totalAmount - b.paidAmount), 0);

  const customerDebt = useMemo(() => {
    const debtMap = new Map<string, { receivable: number; paid: number; unpaid: number }>();
    bills.forEach((b) => {
      if (!debtMap.has(b.customerId)) {
        debtMap.set(b.customerId, { receivable: 0, paid: 0, unpaid: 0 });
      }
      const data = debtMap.get(b.customerId)!;
      data.receivable += b.totalAmount;
      data.paid += b.paidAmount;
      data.unpaid += b.totalAmount - b.paidAmount;
    });
    return Array.from(debtMap.entries())
      .map(([customerId, data]) => {
        const customer = customers.find((c) => c.id === customerId);
        return {
          customerId,
          customerName: customer?.name || '未知客户',
          ...data,
        };
      })
      .sort((a, b) => b.unpaid - a.unpaid)
      .slice(0, 10);
  }, [bills, customers]);

  const maxDebt = customerDebt[0]?.unpaid || 1;

  const monthlyTrend = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map((month) => {
      const monthBills = bills.filter((b) => b.period === month);
      const monthPayments = paymentRecords.filter((p) => p.paymentDate.startsWith(month));
      return {
        label: month.slice(5),
        receivable: monthBills.reduce((acc, b) => acc + b.totalAmount, 0),
        paid: monthPayments.reduce((acc, p) => acc + p.amount, 0),
      };
    });
  }, [bills, paymentRecords, today]);

  const renderLineChart = () => {
    const width = 600;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxValue = Math.max(
      ...monthlyTrend.map((d) => Math.max(d.receivable, d.paid)),
      1
    );

    const xStep = chartW / Math.max(monthlyTrend.length - 1, 1);

    const receivablePoints = monthlyTrend.map((d, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + ((maxValue - d.receivable) / maxValue) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const paidPoints = monthlyTrend.map((d, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + ((maxValue - d.paid) / maxValue) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const receivableAreaPath = `M${padding.left},${padding.top + chartH} L${receivablePoints.split(' ').join(' L')} L${padding.left + (monthlyTrend.length - 1) * xStep},${padding.top + chartH} Z`;
    const paidAreaPath = `M${padding.left},${padding.top + chartH} L${paidPoints.split(' ').join(' L')} L${padding.left + (monthlyTrend.length - 1) * xStep},${padding.top + chartH} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1];
    const yLabels = yTicks.map((t) => Math.round(maxValue * (1 - t) / 1000));

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="receivableGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
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
                ¥{yLabels[i]}k
              </text>
            </g>
          ))}

          <path d={receivableAreaPath} fill="url(#receivableGrad)" />
          <path d={paidAreaPath} fill="url(#paidGrad)" />

          <polyline points={receivablePoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <polyline points={paidPoints} fill="none" stroke="#10b981" strokeWidth="2" />

          {monthlyTrend.map((d, i) => (
            <text
              key={i}
              x={padding.left + i * xStep}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {d.label}月
            </text>
          ))}
        </svg>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">应收金额</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">已收金额</span>
          </div>
        </div>
      </div>
    );
  };

  const getOverdueDays = (dueDate: string) => {
    const due = new Date(dueDate);
    const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">应收款看板</h1>
          <p className="text-sm text-slate-500 mt-1">
            账款回收概览 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="本月应收金额"
          value={`¥${monthlyReceivable.toLocaleString()}`}
          subtitle={`${currentMonthBills.length} 张账单`}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
          trend={{ value: 8.5, label: '较上月' }}
        />
        <StatCard
          title="本月已收金额"
          value={`¥${monthlyPaid.toLocaleString()}`}
          subtitle={`回款率 ${monthlyReceivable > 0 ? Math.round((monthlyPaid / monthlyReceivable) * 100) : 0}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          trend={{ value: 12.3, label: '较上月' }}
        />
        <StatCard
          title="本月未收金额"
          value={`¥${monthlyUnpaid.toLocaleString()}`}
          subtitle={`${currentMonthBills.filter((b) => b.status !== 'paid').length} 张未结清`}
          icon={<TrendingDown className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
        />
        <StatCard
          title="逾期金额"
          value={`¥${overdueAmount.toLocaleString()}`}
          subtitle={`${overdueBills.length} 张逾期账单`}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">月度回款趋势（近6个月）</h3>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          {renderLineChart()}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">客户欠费排行 Top 10</h3>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3.5">
            {customerDebt.map((c, idx) => (
              <div key={c.customerId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className={cn(
                      'w-5 h-5 rounded text-xs flex items-center justify-center font-medium',
                      idx < 3 ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[120px]" title={c.customerName}>
                      {c.customerName.length > 8 ? c.customerName.slice(0, 8) + '…' : c.customerName}
                    </span>
                  </span>
                  <span className="text-red-600 font-medium">¥{c.unpaid.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    style={{ width: `${(c.unpaid / maxDebt) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>应收: ¥{c.receivable.toLocaleString()}</span>
                  <span>已收: ¥{c.paid.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <h3 className="section-title m-0">逾期账单列表</h3>
              <span className="badge badge-danger">{overdueBills.length} 张</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">账单编号</th>
                <th className="table-th">客户名称</th>
                <th className="table-th">账期</th>
                <th className="table-th">应收金额</th>
                <th className="table-th">已收金额</th>
                <th className="table-th">逾期金额</th>
                <th className="table-th">逾期天数</th>
                <th className="table-th">状态</th>
              </tr>
            </thead>
            <tbody>
              {overdueBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-td text-center py-8 text-slate-400 text-sm">
                    暂无逾期账单
                  </td>
                </tr>
              ) : (
                overdueBills.map((b) => {
                  const overdueAmount = b.totalAmount - b.paidAmount;
                  const overdueDays = getOverdueDays(b.dueDate);
                  const statusConfig = BILL_STATUS_MAP[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-red-50/50">
                      <td className="table-td font-mono text-primary-600 font-medium">{b.billNo}</td>
                      <td className="table-td text-slate-700 font-medium">{b.customerName}</td>
                      <td className="table-td text-slate-600">{b.period}</td>
                      <td className="table-td">¥{b.totalAmount.toLocaleString()}</td>
                      <td className="table-td text-emerald-600">¥{b.paidAmount.toLocaleString()}</td>
                      <td className="table-td text-red-600 font-semibold">¥{overdueAmount.toLocaleString()}</td>
                      <td className="table-td">
                        <span className="text-red-600 font-medium">{overdueDays} 天</span>
                      </td>
                      <td className="table-td">
                        <span className={cn(
                          'badge',
                          b.status === 'overdue' ? 'badge-danger' : 'badge-warning'
                        )}>
                          {statusConfig}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
