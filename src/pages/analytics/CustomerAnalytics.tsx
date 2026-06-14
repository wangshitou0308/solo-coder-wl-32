import { useMemo } from 'react';
import { Users, Archive, FileSearch, AlertTriangle, TrendingUp, Clock, FileText, DollarSign } from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import type { Customer, Contract, Bill, Accession } from '@/types';

interface CustomerRanking {
  customer: Customer;
  rank: number;
  value: number;
  billCount?: number;
}

interface ContractExpiry {
  contract: Contract;
  daysRemaining: number;
}

export default function CustomerAnalytics() {
  const { customers, archives, accessions, contracts, bills } = useAppStore();

  const totalCustomers = customers.length;
  const totalArchives = archives.length;
  const totalAccessions = accessions.length;
  const totalOverdue = accessions.filter(
    (a) => a.status === 'overdue' || (a.status !== 'returned' && a.status !== 'pending' && a.status !== 'rejected' && a.expectedReturnDate < new Date().toISOString().slice(0, 10))
  ).length;

  const archiveRanking = useMemo((): CustomerRanking[] => {
    return [...customers]
      .sort((a, b) => b.archiveCount - a.archiveCount)
      .slice(0, 10)
      .map((customer, index) => ({
        customer,
        rank: index + 1,
        value: customer.archiveCount,
      }));
  }, [customers]);

  const accessRanking = useMemo((): CustomerRanking[] => {
    return [...customers]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map((customer, index) => ({
        customer,
        rank: index + 1,
        value: customer.accessCount,
      }));
  }, [customers]);

  const billRanking = useMemo((): CustomerRanking[] => {
    const customerBills = new Map<string, { total: number; count: number }>();
    bills.forEach((bill) => {
      const existing = customerBills.get(bill.customerId) || { total: 0, count: 0 };
      customerBills.set(bill.customerId, {
        total: existing.total + bill.totalAmount,
        count: existing.count + 1,
      });
    });

    return [...customers]
      .map((customer) => {
        const billData = customerBills.get(customer.id) || { total: 0, count: 0 };
        return {
          customer,
          rank: 0,
          value: billData.total,
          billCount: billData.count,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [customers, bills]);

  const overdueRanking = useMemo((): CustomerRanking[] => {
    const customerOverdue = new Map<string, number>();
    accessions.forEach((accession: Accession) => {
      const isOverdue = accession.status === 'overdue' || 
        (accession.status !== 'returned' && accession.status !== 'pending' && accession.status !== 'rejected' && accession.expectedReturnDate < new Date().toISOString().slice(0, 10));
      if (isOverdue) {
        customerOverdue.set(accession.customerId, (customerOverdue.get(accession.customerId) || 0) + 1);
      }
    });

    return [...customers]
      .map((customer) => ({
        customer,
        rank: 0,
        value: customerOverdue.get(customer.id) || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [customers, accessions]);

  const expiringContracts = useMemo((): ContractExpiry[] => {
    const today = new Date();
    const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    return contracts
      .filter((contract) => {
        const endDate = new Date(contract.endDate);
        return endDate >= today && endDate <= ninetyDaysLater && contract.status === 'active';
      })
      .map((contract) => {
        const endDate = new Date(contract.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { contract, daysRemaining };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [contracts]);

  const maxArchiveValue = archiveRanking[0]?.value || 1;
  const maxAccessValue = accessRanking[0]?.value || 1;
  const maxBillValue = billRanking[0]?.value || 1;
  const maxOverdueValue = overdueRanking[0]?.value || 1;

  const barChartData = useMemo(() => {
    const top5Archive = archiveRanking.slice(0, 5).map((r) => ({ name: r.customer.name, value: r.value }));
    const top5Access = accessRanking.slice(0, 5).map((r) => ({ name: r.customer.name, value: r.value }));
    const top5Bill = billRanking.slice(0, 5).map((r) => ({ name: r.customer.name, value: r.value }));
    const top5Overdue = overdueRanking.slice(0, 5).map((r) => ({ name: r.customer.name, value: r.value }));

    return { top5Archive, top5Access, top5Bill, top5Overdue };
  }, [archiveRanking, accessRanking, billRanking, overdueRanking]);

  const BarChart = ({ data, title, color, unit = '' }: { data: { name: string; value: number }[]; title: string; color: string; unit?: string }) => {
    const width = 280;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 60, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const barWidth = chartW / data.length * 0.6;
    const gap = chartW / data.length * 0.4;

    return (
      <div className="flex flex-col items-center">
        <h4 className="text-sm font-medium text-slate-700 mb-2">{title}</h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + t * chartH}
                x2={width - padding.right}
                y2={padding.top + t * chartH}
                stroke="#e2e8f0"
                strokeDasharray={i === 4 ? '' : '3 3'}
              />
              <text
                x={padding.left - 6}
                y={padding.top + t * chartH + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
              >
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
                  fill={`url(#grad-${title})`}
                  rx="3"
                  className="transition-all duration-300 hover:opacity-80"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#475569"
                  fontWeight="500"
                >
                  {d.value}{unit}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748b"
                  transform={`rotate(-30, ${x + barWidth / 2}, ${height - padding.bottom + 10})`}
                >
                  {d.name.length > 6 ? d.name.slice(0, 6) + '…' : d.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-white';
    if (rank === 2) return 'bg-slate-400 text-white';
    if (rank === 3) return 'bg-orange-400 text-white';
    return 'bg-slate-100 text-slate-600';
  };

  const RankingItem = ({
    item,
    maxValue,
    showProgress = true,
    showBillCount = false,
    progressColor = 'from-primary-500 to-accent-500',
    valueLabel = '',
  }: {
    item: CustomerRanking;
    maxValue: number;
    showProgress?: boolean;
    showBillCount?: boolean;
    progressColor?: string;
    valueLabel?: string;
  }) => (
    <div key={item.customer.id} className="py-2.5 border-b border-slate-50 last:border-b-0">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium shrink-0 ${getRankBadgeClass(item.rank)}`}
          >
            {item.rank}
          </span>
          <span className="text-slate-700 font-medium truncate">
            {item.customer.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showBillCount && (
            <span className="text-xs text-slate-500">
              {item.billCount || 0} 笔账单
            </span>
          )}
          <span className="text-slate-800 font-semibold">
            {item.value.toLocaleString()}
            {valueLabel}
          </span>
        </div>
      </div>
      {showProgress && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-8.5">
          <div
            className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${(item.value / maxValue) * 100}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">客户分析</h1>
          <p className="text-sm text-slate-500 mt-1">多维度客户数据统计与排行分析</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="客户总数"
          value={totalCustomers.toLocaleString()}
          subtitle="累计登记客户"
          icon={<Users className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
          trend={{ value: 3.5, label: '较上月' }}
        />
        <StatCard
          title="档案总数量"
          value={totalArchives.toLocaleString()}
          subtitle="盒档案"
          icon={<Archive className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          trend={{ value: 6.2, label: '较上月' }}
        />
        <StatCard
          title="调阅总次数"
          value={totalAccessions.toLocaleString()}
          subtitle="累计调阅记录"
          icon={<FileSearch className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          trend={{ value: 8.4, label: '较上月' }}
        />
        <StatCard
          title="逾期总次数"
          value={totalOverdue.toLocaleString()}
          subtitle="逾期未归还"
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-rose-600 to-rose-800"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            各维度 Top5 对比
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BarChart
            data={barChartData.top5Archive}
            title="寄存量排行"
            color="#3b82f6"
            unit="盒"
          />
          <BarChart
            data={barChartData.top5Access}
            title="调阅频次排行"
            color="#10b981"
            unit="次"
          />
          <BarChart
            data={barChartData.top5Bill}
            title="账单金额排行"
            color="#f59e0b"
            unit="元"
          />
          <BarChart
            data={barChartData.top5Overdue}
            title="逾期次数排行"
            color="#ef4444"
            unit="次"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Archive className="w-5 h-5 text-primary-600" />
              寄存量排行 Top 10
            </h3>
            <span className="badge badge-primary">{maxArchiveValue} 盒</span>
          </div>
          <div className="space-y-0">
            {archiveRanking.map((item) => (
              <RankingItem
                key={item.customer.id}
                item={item}
                maxValue={maxArchiveValue}
                progressColor="from-primary-500 to-primary-400"
                valueLabel=" 盒"
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-emerald-600" />
              调阅频次排行 Top 10
            </h3>
            <span className="badge badge-success">{maxAccessValue} 次</span>
          </div>
          <div className="space-y-0">
            {accessRanking.map((item) => (
              <RankingItem
                key={item.customer.id}
                item={item}
                maxValue={maxAccessValue}
                progressColor="from-emerald-500 to-emerald-400"
                valueLabel=" 次"
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              账单金额排行 Top 10
            </h3>
            <span className="badge badge-warning">¥{maxBillValue.toLocaleString()}</span>
          </div>
          <div className="space-y-0">
            {billRanking.map((item) => (
              <RankingItem
                key={item.customer.id}
                item={item}
                maxValue={maxBillValue}
                showBillCount
                progressColor="from-amber-500 to-amber-400"
                valueLabel=" 元"
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              逾期次数排行 Top 10
            </h3>
            <span className="badge badge-danger">{maxOverdueValue} 次</span>
          </div>
          <div className="space-y-0">
            {overdueRanking.map((item) => (
              <RankingItem
                key={item.customer.id}
                item={item}
                maxValue={maxOverdueValue}
                progressColor="from-rose-500 to-rose-400"
                valueLabel=" 次"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            合同到期提醒（未来90天）
          </h3>
          <span className="badge badge-warning">{expiringContracts.length} 份</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">客户名称</th>
                <th className="table-th">合同编号</th>
                <th className="table-th">到期日期</th>
                <th className="table-th">剩余天数</th>
                <th className="table-th">状态</th>
              </tr>
            </thead>
            <tbody>
              {expiringContracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-td text-center py-8 text-slate-400 text-sm">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    暂无即将到期的合同
                  </td>
                </tr>
              ) : (
                expiringContracts.map(({ contract, daysRemaining }) => (
                  <tr key={contract.id} className="hover:bg-slate-50/50">
                    <td className="table-td font-medium text-slate-700">{contract.customerName}</td>
                    <td className="table-td font-mono text-primary-600">{contract.contractNo}</td>
                    <td className="table-td text-slate-600">{contract.endDate}</td>
                    <td className="table-td">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          daysRemaining <= 7
                            ? 'bg-red-100 text-red-700'
                            : daysRemaining <= 30
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {daysRemaining <= 7 ? (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        ) : null}
                        {daysRemaining} 天
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="badge badge-primary">执行中</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
