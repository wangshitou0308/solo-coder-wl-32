import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileSearch, CheckCircle, XCircle, LogOut, Undo2, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待审批', cls: 'badge-warning' },
  approved: { label: '已批准', cls: 'badge-primary' },
  rejected: { label: '已拒绝', cls: 'badge-slate' },
  outbound: { label: '已出库', cls: 'badge-accent' },
  in_reading: { label: '阅览中', cls: 'badge-primary' },
  returned: { label: '已归还', cls: 'badge-success' },
  overdue: { label: '已逾期', cls: 'badge-danger' },
};

export default function AccessionList() {
  const { accessions, approveAccession, rejectAccession, outboundAccession, returnAccession } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = accessions
    .filter((a) => !search || a.accessionNo.includes(search) || a.customerName.includes(search) || a.applicant.includes(search))
    .filter((a) => !statusFilter || a.status === statusFilter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">调阅服务管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {accessions.length} 笔调阅申请记录</p>
        </div>
        <Link to="/accessions/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          新建调阅申请
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="搜索申请编号、客户、申请人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="select pl-9 w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部状态</option>
              {Object.entries(statusMap).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">申请编号</th>
                <th className="table-th">客户信息</th>
                <th className="table-th">用途</th>
                <th className="table-th">档案数</th>
                <th className="table-th">申请日期</th>
                <th className="table-th">预计归还</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition">
                  <td className="table-td font-mono text-primary-600 font-medium">{a.accessionNo}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <FileSearch className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{a.customerName}</div>
                        <div className="text-xs text-slate-500">申请人：{a.applicant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="badge badge-accent">{a.purposeName}</span>
                  </td>
                  <td className="table-td font-medium text-slate-700">{a.items.length} 盒</td>
                  <td className="table-td text-slate-600">{a.createdAt}</td>
                  <td className={cn('table-td', a.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-600')}>
                    {a.expectedReturnDate}
                  </td>
                  <td className="table-td">
                    <span className={cn('badge', statusMap[a.status]?.cls)}>{statusMap[a.status]?.label}</span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-ghost btn-sm" title="查看详情"><Eye className="w-3.5 h-3.5" /></button>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => approveAccession(a.id)} className="btn btn-sm btn-success" style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}>
                            <CheckCircle className="w-3.5 h-3.5" /> 通过
                          </button>
                          <button onClick={() => rejectAccession(a.id)} className="btn btn-sm btn-danger">
                            <XCircle className="w-3.5 h-3.5" /> 拒绝
                          </button>
                        </>
                      )}
                      {(a.status === 'approved') && (
                        <button onClick={() => outboundAccession(a.id)} className="btn btn-sm btn-primary">
                          <LogOut className="w-3.5 h-3.5" /> 扫码出库
                        </button>
                      )}
                      {(a.status === 'outbound' || a.status === 'in_reading' || a.status === 'overdue') && (
                        <button onClick={() => returnAccession(a.id)} className="btn btn-sm btn-accent">
                          <Undo2 className="w-3.5 h-3.5" /> 归还上架
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">暂无匹配的调阅申请</div>
        )}
      </div>
    </div>
  );
}
