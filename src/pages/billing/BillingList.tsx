import { useState } from 'react';
import { Receipt, DollarSign, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: '待生成', cls: 'badge-slate', icon: Clock },
  issued: { label: '已开票', cls: 'badge-primary', icon: Receipt },
  paid: { label: '已支付', cls: 'badge-success', icon: CheckCircle },
  overdue: { label: '已逾期', cls: 'badge-danger', icon: AlertCircle },
};

export default function BillingList() {
  const { bills, generateBill, payBill } = useAppStore();
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const totalStorage = bills.reduce((acc, b) => acc + b.storageFee, 0);
  const totalAccess = bills.reduce((acc, b) => acc + b.accessFee, 0);
  const totalAmount = bills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = bills.filter((b) => b.status === 'paid').reduce((acc, b) => acc + b.totalAmount, 0);
  const totalUnpaid = bills.filter((b) => b.status !== 'paid').reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">账单管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {bills.length} 条账单记录</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            className="input w-44"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => generateBill(period)}>
            <Receipt className="w-4 h-4" />
            生成月度账单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">账单总额</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalAmount.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">已收款</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalPaid.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">未收款</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalUnpaid.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">调阅服务费</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalAccess.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">账单编号</th>
                <th className="table-th">客户</th>
                <th className="table-th">账期</th>
                <th className="table-th">寄存费</th>
                <th className="table-th">调阅服务费</th>
                <th className="table-th">合计</th>
                <th className="table-th">开票日期</th>
                <th className="table-th">到期日期</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => {
                const Config = statusMap[b.status];
                const Icon = Config.icon;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="table-td font-mono text-primary-600 font-medium">{b.billNo}</td>
                    <td className="table-td text-slate-700 font-medium">{b.customerName}</td>
                    <td className="table-td text-slate-600">{b.period}</td>
                    <td className="table-td">¥{b.storageFee.toLocaleString()}</td>
                    <td className="table-td">¥{b.accessFee.toLocaleString()}</td>
                    <td className="table-td font-semibold text-slate-800">¥{b.totalAmount.toLocaleString()}</td>
                    <td className="table-td text-slate-600">{b.issueDate}</td>
                    <td className={cn('table-td', b.status === 'overdue' && 'text-red-600 font-medium')}>
                      {b.dueDate}
                    </td>
                    <td className="table-td">
                      <span className={cn('badge', Config.cls)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {Config.label}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost btn-sm"><Download className="w-3.5 h-3.5" /></button>
                        {b.status !== 'paid' && b.status !== 'pending' && (
                          <button onClick={() => payBill(b.id)} className="btn btn-sm btn-primary">
                            <CheckCircle className="w-3.5 h-3.5" /> 确认收款
                          </button>
                        )}
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
