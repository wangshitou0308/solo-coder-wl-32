import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import { PURPOSE_MAP } from '@/types';

export default function AccessionNew() {
  const navigate = useNavigate();
  const { customers, archives, addAccession } = useAppStore();
  const [form, setForm] = useState({
    customerId: '',
    applicant: '',
    purpose: 'reference' as any,
    durationDays: 3,
    startTime: new Date().toISOString().slice(0, 10),
  });
  const [selectedArchives, setSelectedArchives] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const customer = customers.find((c) => c.id === form.customerId);
  const availableArchives = archives
    .filter((a) => a.customerId === form.customerId && a.status === 'in_stock')
    .filter((a) => !typeFilter || a.type === typeFilter)
    .filter((a) => !searchQuery || a.title.includes(searchQuery) || a.barcode.includes(searchQuery) || a.boxNo.includes(searchQuery));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || selectedArchives.length === 0) return;
    const items = selectedArchives.map((id) => {
      const a = archives.find((x) => x.id === id)!;
      return {
        archiveId: a.id,
        barcode: a.barcode,
        title: a.title,
        boxNo: a.boxNo,
      };
    });
    const expected = new Date(form.startTime);
    expected.setDate(expected.getDate() + form.durationDays);
    addAccession({
      customerId: form.customerId,
      customerName: customer.name,
      applicant: form.applicant,
      purpose: form.purpose,
      purposeName: PURPOSE_MAP[form.purpose],
      durationDays: form.durationDays,
      startTime: form.startTime,
      expectedReturnDate: expected.toISOString().slice(0, 10),
      items: items as any,
    });
    navigate('/accessions');
  };

  const toggleArchive = (id: string) => {
    setSelectedArchives((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to="/accessions" className="btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">新建调阅申请</h1>
          <p className="text-sm text-slate-500 mt-1">选择客户与档案，填写调阅用途与使用时长</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-600 rounded" />
            调阅申请信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">客户 <span className="text-red-500">*</span></label>
              <select
                className="select"
                required
                value={form.customerId}
                onChange={(e) => { setForm({ ...form, customerId: e.target.value }); setSelectedArchives([]); }}
              >
                <option value="">请选择客户</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}（在库 {c.archiveCount} 盒）</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">申请人 <span className="text-red-500">*</span></label>
              <input
                className="input"
                required
                placeholder="申请人姓名"
                value={form.applicant}
                onChange={(e) => setForm({ ...form, applicant: e.target.value })}
              />
            </div>
            <div>
              <label className="label">调阅用途 <span className="text-red-500">*</span></label>
              <select
                className="select"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              >
                {Object.entries(PURPOSE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">使用时长 (天)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="label">开始日期</label>
              <input
                type="date"
                className="input"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title flex items-center gap-2">
              <span className="w-1 h-5 bg-accent-500 rounded" />
              选择调阅档案 ({selectedArchives.length} 盒已选)
            </h3>
          </div>

          {form.customerId ? (
            <>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-9"
                    placeholder="搜索档案标题、条码、盒号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="select md:w-40"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">全部类型</option>
                  <option value="finance">财务凭证</option>
                  <option value="personnel">人事档案</option>
                  <option value="contract">合同档案</option>
                  <option value="engineering">工程图纸</option>
                  <option value="medical">医疗病历</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded-lg max-h-80 overflow-auto scrollbar-thin">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="table-th w-10">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={availableArchives.length > 0 && availableArchives.every((a) => selectedArchives.includes(a.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchives(availableArchives.map((a) => a.id));
                            } else {
                              setSelectedArchives([]);
                            }
                          }}
                        />
                      </th>
                      <th className="table-th">档案信息</th>
                      <th className="table-th">类型</th>
                      <th className="table-th">架位</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableArchives.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => toggleArchive(a.id)}
                        className={`cursor-pointer transition ${selectedArchives.includes(a.id) ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="table-td">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedArchives.includes(a.id)}
                            onChange={() => toggleArchive(a.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="table-td">
                          <div className="font-medium text-slate-800">{a.title}</div>
                          <div className="text-xs text-slate-500 font-mono">{a.barcode} · {a.boxNo}</div>
                        </td>
                        <td className="table-td">
                          <span className="badge badge-primary">{a.typeName}</span>
                        </td>
                        <td className="table-td font-mono text-xs text-slate-600">{a.positionCode}</td>
                      </tr>
                    ))}
                    {availableArchives.length === 0 && (
                      <tr>
                        <td colSpan={4} className="table-td text-center text-slate-400 py-8">
                          该客户暂无可调阅的在库档案
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
              请先选择客户以加载可选择的档案
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/accessions" className="btn btn-secondary">取消</Link>
          <button type="submit" className="btn btn-primary" disabled={!form.customerId || !form.applicant || selectedArchives.length === 0}>
            <Save className="w-4 h-4" />
            提交申请
          </button>
        </div>
      </form>
    </div>
  );
}
