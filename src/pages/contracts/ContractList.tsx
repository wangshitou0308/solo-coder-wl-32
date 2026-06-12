import { FileText, Calendar, Box, DollarSign, Users } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: '生效中', cls: 'badge-success' },
  expired: { label: '已到期', cls: 'badge-slate' },
  terminated: { label: '已终止', cls: 'badge-danger' },
};

export default function ContractList() {
  const { contracts } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">合同管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {contracts.length} 份客户寄存合同</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contracts.map((c) => {
          const today = new Date();
          const end = new Date(c.endDate);
          const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
          const isNearExpiry = daysLeft > 0 && daysLeft <= 90;

          return (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-serif">{c.customerName}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{c.contractNo}</div>
                  </div>
                </div>
                <span className={cn('badge', statusMap[c.status].cls)}>{statusMap[c.status].label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    合同期限
                  </div>
                  <div className="text-sm font-medium text-slate-700">{c.startDate}</div>
                  <div className="text-xs text-slate-400">至 {c.endDate}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Box className="w-3 h-3" />
                    寄存上限
                  </div>
                  <div className="text-sm font-medium text-slate-700">{c.maxBoxes} 盒</div>
                  <div className={cn('text-xs', isNearExpiry ? 'text-amber-600 font-medium' : 'text-slate-400')}>
                    {daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已到期'}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500 mb-3">费用标准</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerBox}</div>
                    <div className="text-[10px] text-slate-500">每盒/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerVolume}</div>
                    <div className="text-[10px] text-slate-500">每m³/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerWeight}</div>
                    <div className="text-[10px] text-slate-500">每kg/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-600 font-serif">¥{c.accessFeePerTime}</div>
                    <div className="text-[10px] text-slate-500">调阅/次</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
