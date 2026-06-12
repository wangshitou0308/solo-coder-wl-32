import { useState } from 'react';
import { Plus, Search, Filter, Archive as ArchiveIcon, Barcode, Edit3, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import { ARCHIVE_TYPE_MAP } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; cls: string }> = {
  in_stock: { label: '在库', cls: 'badge-success' },
  out_reading: { label: '阅览中', cls: 'badge-primary' },
  out_borrowed: { label: '已借出', cls: 'badge-warning' },
  inventory: { label: '盘点中', cls: 'badge-accent' },
  destroyed: { label: '已销毁', cls: 'badge-slate' },
  pending_destroy: { label: '待销毁', cls: 'badge-danger' },
};

export default function ArchiveList() {
  const { archives } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = archives.filter((a) => {
    const matchSearch = !search || a.title.includes(search) || a.barcode.includes(search) || a.boxNo.includes(search) || a.customerName.includes(search);
    const matchType = !typeFilter || a.type === typeFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">档案入库管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {archives.length} 盒档案登记在册</p>
        </div>
        <Link to="/archives/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          新增档案入库
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="搜索档案标题、条码、盒号、客户名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="select pl-9 w-44"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">全部类型</option>
                {Object.entries(ARCHIVE_TYPE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <select
              className="select w-36"
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
                <th className="table-th">档案信息</th>
                <th className="table-th">类型</th>
                <th className="table-th">客户</th>
                <th className="table-th">架位</th>
                <th className="table-th">保管期限</th>
                <th className="table-th">入库日期</th>
                <th className="table-th">到期日期</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <ArchiveIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate max-w-[200px]">{a.title}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1"><Barcode className="w-3 h-3" />{a.barcode}</span>
                          <span>·</span>
                          <span>{a.boxNo}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="badge badge-primary">{a.typeName}</span>
                  </td>
                  <td className="table-td text-slate-700">{a.customerName}</td>
                  <td className="table-td font-mono text-xs text-slate-600">{a.positionCode || '-'}</td>
                  <td className="table-td text-slate-700">
                    {a.retentionPeriod === 'permanent' ? '永久' : a.retentionPeriod === '30years' ? '30年' : a.retentionPeriod === '10years' ? '10年' : a.retentionPeriod === '5years' ? '5年' : `${a.retentionYears}年`}
                  </td>
                  <td className="table-td text-slate-600">{a.storageDate}</td>
                  <td className={cn('table-td', new Date(a.expiryDate) < new Date() ? 'text-red-600 font-medium' : 'text-slate-600')}>
                    {a.expiryDate}
                  </td>
                  <td className="table-td">
                    <span className={cn('badge', statusMap[a.status]?.cls)}>{statusMap[a.status]?.label}</span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-ghost btn-sm"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="btn-ghost btn-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 30 && (
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500 text-center">
            显示前 30 条，共 {filtered.length} 条结果
          </div>
        )}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">暂无匹配的档案记录</div>
        )}
      </div>
    </div>
  );
}
