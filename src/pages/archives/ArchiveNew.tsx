import { useState } from 'react';
import { ArrowLeft, Save, Barcode } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { ARCHIVE_TYPE_MAP, RETENTION_MAP } from '@/types';

export default function ArchiveNew() {
  const navigate = useNavigate();
  const { customers, addArchive } = useAppStore();
  const [form, setForm] = useState({
    customerId: '',
    type: 'finance' as any,
    title: '',
    boxNo: '',
    volume: 0.2,
    weight: 2,
    retentionPeriod: '10years' as any,
    retentionYears: 10,
    storageDate: new Date().toISOString().slice(0, 10),
    metadata: {} as Record<string, string>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === form.customerId);
    const expiry = new Date(form.storageDate);
    if (form.retentionPeriod === 'permanent') expiry.setFullYear(expiry.getFullYear() + 999);
    else expiry.setFullYear(expiry.getFullYear() + (form.retentionYears || 10));

    addArchive({
      customerId: form.customerId,
      customerName: customer?.name || '',
      type: form.type,
      typeName: ARCHIVE_TYPE_MAP[form.type],
      title: form.title,
      boxNo: form.boxNo,
      volume: form.volume,
      weight: form.weight,
      retentionPeriod: form.retentionPeriod,
      retentionYears: form.retentionPeriod === 'custom' ? form.retentionYears : undefined,
      storageDate: form.storageDate,
      expiryDate: expiry.toISOString().slice(0, 10),
      status: 'in_stock',
      metadata: form.metadata,
    });
    navigate('/archives');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to="/archives" className="btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">新增档案入库</h1>
          <p className="text-sm text-slate-500 mt-1">登记档案元数据，系统将自动分配架位并生成条码</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-600 rounded" />
            基本信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">寄存客户 <span className="text-red-500">*</span></label>
              <select
                className="select"
                required
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              >
                <option value="">请选择客户</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">档案类型 <span className="text-red-500">*</span></label>
              <select
                className="select"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {Object.entries(ARCHIVE_TYPE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">档案标题 / 名称 <span className="text-red-500">*</span></label>
              <input
                className="input"
                required
                placeholder="例：2024年第一季度财务凭证"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">档案盒号 <span className="text-red-500">*</span></label>
              <input
                className="input font-mono"
                required
                placeholder="例：BOX-CUST-0001"
                value={form.boxNo}
                onChange={(e) => setForm({ ...form, boxNo: e.target.value })}
              />
            </div>
            <div>
              <label className="label">入库日期</label>
              <input
                type="date"
                className="input"
                value={form.storageDate}
                onChange={(e) => setForm({ ...form, storageDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">体积 (m³)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="label">重量 (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="label">保管期限</label>
              <select
                className="select"
                value={form.retentionPeriod}
                onChange={(e) => setForm({ ...form, retentionPeriod: e.target.value })}
              >
                {Object.entries(RETENTION_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {form.retentionPeriod === 'custom' && (
              <div>
                <label className="label">自定义年限 (年)</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={form.retentionYears}
                  onChange={(e) => setForm({ ...form, retentionYears: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent-500 rounded" />
            架位分配预览
          </h3>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Barcode className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">系统将自动分配空闲架位</div>
              <div className="text-sm text-slate-700 font-medium mt-0.5">按 库房 → 列 → 面 → 层 四级结构智能排架</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/archives" className="btn btn-secondary">取消</Link>
          <button type="submit" className="btn btn-primary">
            <Save className="w-4 h-4" />
            确认入库并生成条码
          </button>
        </div>
      </form>
    </div>
  );
}
