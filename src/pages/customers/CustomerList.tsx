import { useState } from 'react';
import { Plus, Search, Users, Box, FileSearch, Phone, MapPin, Building2 } from 'lucide-react';
import { useAppStore } from '@/store';

export default function CustomerList() {
  const { customers } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) => !search || c.name.includes(search) || c.contactPerson.includes(search) || c.contactPhone.includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">客户管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {customers.length} 家合作客户</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="搜索客户名称、联系人、联系电话..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, idx) => (
          <div key={c.id} className="card p-5 hover:shadow-card-hover transition-all group">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${['#1e3a5f', '#c9a962', '#059669', '#dc2626', '#7c3aed', '#0891b2'][idx % 6]} 0%, ${['#18304f', '#8a6f37', '#047857', '#b91c1c', '#6d28d9', '#0e7490'][idx % 6]} 100%)`,
                }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 font-serif truncate">{c.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">合作始于 {c.createdAt}</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="truncate">{c.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="truncate font-mono">{c.contactPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate line-clamp-2">{c.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="text-center p-2.5 rounded-lg bg-primary-50/50">
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-0.5">
                  <Box className="w-3 h-3" />
                  寄存档案
                </div>
                <div className="text-xl font-bold text-primary-700 font-serif">{c.archiveCount}</div>
                <div className="text-[10px] text-slate-400">盒</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-accent-50/50">
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-0.5">
                  <FileSearch className="w-3 h-3" />
                  调阅次数
                </div>
                <div className="text-xl font-bold text-accent-700 font-serif">{c.accessCount}</div>
                <div className="text-[10px] text-slate-400">次</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
