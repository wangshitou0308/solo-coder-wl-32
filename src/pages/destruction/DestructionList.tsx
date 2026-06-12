import { Trash2, UserCheck, ShieldCheck, CheckCircle, Clock, FileCheck, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; cls: string; icon: any; steps: number }> = {
  pending_customer: { label: '待客户审批', cls: 'badge-warning', icon: Clock, steps: 1 },
  pending_manager: { label: '待主管审批', cls: 'badge-accent', icon: ShieldCheck, steps: 2 },
  approved: { label: '审批通过', cls: 'badge-primary', icon: CheckCircle, steps: 3 },
  executed: { label: '已销毁', cls: 'badge-slate', icon: Trash2, steps: 4 },
  rejected: { label: '已拒绝', cls: 'badge-danger', icon: AlertTriangle, steps: 0 },
};

const methodMap: Record<string, string> = {
  shred: '碎纸销毁',
  burn: '焚烧销毁',
  pulping: '打浆销毁',
  other: '其他方式',
};

export default function DestructionList() {
  const { destructions, approveDestructionByCustomer, approveDestructionByManager, executeDestruction, archives, customers } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">销毁管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {destructions.length} 条销毁记录 · 档案到期自动提醒，销毁需经双重审批</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">待客户审批</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{destructions.filter((d) => d.status === 'pending_customer').length}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">待主管审批</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{destructions.filter((d) => d.status === 'pending_manager').length}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">待执行销毁</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{destructions.filter((d) => d.status === 'approved').length}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">已完成销毁</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{destructions.filter((d) => d.status === 'executed').length}</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">档案信息</th>
                <th className="table-th">客户</th>
                <th className="table-th">销毁方式</th>
                <th className="table-th">审批进度</th>
                <th className="table-th">监销人</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {destructions.map((d) => {
                const Config = statusConfig[d.status];
                const Icon = Config.icon;
                const steps = [
                  { label: '客户审批', done: d.customerApproved },
                  { label: '主管审批', done: d.managerApproved },
                  { label: '执行销毁', done: d.status === 'executed' || d.status === 'approved' },
                ];
                return (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{d.title}</div>
                          <div className="text-xs text-slate-500 font-mono">{d.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-700">{d.customerName}</td>
                    <td className="table-td">{methodMap[d.destroyMethod] || '-'}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        {steps.map((s, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                              s.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
                            )}>
                              {s.done ? '✓' : i + 1}
                            </div>
                            {i < steps.length - 1 && <div className={cn('w-5 h-px', s.done ? 'bg-emerald-300' : 'bg-slate-200')} />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="table-td text-slate-600">{d.supervisor}</td>
                    <td className="table-td">
                      <span className={cn('badge', Config.cls)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {Config.label}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      {d.status === 'pending_customer' && (
                        <button onClick={() => approveDestructionByCustomer(d.id, d.customerApprover || customers.find((c) => c.id === d.customerId)?.contactPerson || '客户代表')} className="btn btn-sm btn-primary">
                          <UserCheck className="w-3.5 h-3.5" /> 客户审批通过
                        </button>
                      )}
                      {d.status === 'pending_manager' && (
                        <button onClick={() => approveDestructionByManager(d.id, '档案中心王主任')} className="btn btn-sm btn-accent">
                          <ShieldCheck className="w-3.5 h-3.5" /> 主管审批通过
                        </button>
                      )}
                      {d.status === 'approved' && (
                        <button onClick={() => executeDestruction(d.id, new Date().toISOString().slice(0, 10))} className="btn btn-sm btn-danger">
                          <Trash2 className="w-3.5 h-3.5" /> 执行销毁
                        </button>
                      )}
                      {d.status === 'executed' && (
                        <button className="btn btn-sm btn-ghost">查看销毁证明</button>
                      )}
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
