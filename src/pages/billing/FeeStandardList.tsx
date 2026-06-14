import { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X, Package, Box, Scale, FileText, Clock, AlertCircle, DollarSign, Users } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { FeeStandard, FeeBasis } from '@/types';
import { FEE_BASIS_MAP } from '@/types';

const scopeMap: Record<string, { label: string; cls: string; icon: any }> = {
  general: { label: '通用', cls: 'badge-primary', icon: Settings },
  customer: { label: '客户专属', cls: 'badge-accent', icon: Users },
  contract: { label: '合同专属', cls: 'badge-slate', icon: FileText },
};

const feeBasisIconMap: Record<FeeBasis, any> = {
  box: Box,
  volume: Package,
  weight: Scale,
};

interface FormData {
  name: string;
  customerId: string;
  contractId: string;
  feeBasis: FeeBasis;
  feePerBox: string;
  feePerVolume: string;
  feePerWeight: string;
  accessFeePerTime: string;
  overdueFeePerDay: string;
  destructionFeePerItem: string;
  manualServiceFeePerHour: string;
  minimumChargePerMonth: string;
  isDefault: boolean;
}

const defaultFormData: FormData = {
  name: '',
  customerId: '',
  contractId: '',
  feeBasis: 'box',
  feePerBox: '',
  feePerVolume: '',
  feePerWeight: '',
  accessFeePerTime: '',
  overdueFeePerDay: '',
  destructionFeePerItem: '',
  manualServiceFeePerHour: '',
  minimumChargePerMonth: '',
  isDefault: false,
};

export default function FeeStandardList() {
  const { feeStandards, customers, contracts, addFeeStandard, updateFeeStandard, deleteFeeStandard } = useAppStore();
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterContract, setFilterContract] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const getScope = (fs: FeeStandard) => {
    if (fs.contractId) return 'contract';
    if (fs.customerId) return 'customer';
    return 'general';
  };

  const filteredStandards = feeStandards.filter((fs) => {
    if (filterCustomer && fs.customerId !== filterCustomer) return false;
    if (filterContract && fs.contractId !== filterContract) return false;
    return true;
  });

  const handleAdd = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleEdit = (fs: FeeStandard) => {
    setEditingId(fs.id);
    setFormData({
      name: fs.name,
      customerId: fs.customerId || '',
      contractId: fs.contractId || '',
      feeBasis: fs.feeBasis,
      feePerBox: fs.feePerBox.toString(),
      feePerVolume: fs.feePerVolume.toString(),
      feePerWeight: fs.feePerWeight.toString(),
      accessFeePerTime: fs.accessFeePerTime.toString(),
      overdueFeePerDay: fs.overdueFeePerDay.toString(),
      destructionFeePerItem: fs.destructionFeePerItem.toString(),
      manualServiceFeePerHour: fs.manualServiceFeePerHour.toString(),
      minimumChargePerMonth: fs.minimumChargePerMonth.toString(),
      isDefault: fs.isDefault,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该费用标准吗？')) {
      deleteFeeStandard(id);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入费用标准名称');
      return;
    }

    const data = {
      name: formData.name.trim(),
      customerId: formData.customerId || undefined,
      customerName: formData.customerId ? customers.find((c) => c.id === formData.customerId)?.name : undefined,
      contractId: formData.contractId || undefined,
      contractNo: formData.contractId ? contracts.find((c) => c.id === formData.contractId)?.contractNo : undefined,
      feeBasis: formData.feeBasis,
      feePerBox: parseFloat(formData.feePerBox) || 0,
      feePerVolume: parseFloat(formData.feePerVolume) || 0,
      feePerWeight: parseFloat(formData.feePerWeight) || 0,
      accessFeePerTime: parseFloat(formData.accessFeePerTime) || 0,
      overdueFeePerDay: parseFloat(formData.overdueFeePerDay) || 0,
      destructionFeePerItem: parseFloat(formData.destructionFeePerItem) || 0,
      manualServiceFeePerHour: parseFloat(formData.manualServiceFeePerHour) || 0,
      minimumChargePerMonth: parseFloat(formData.minimumChargePerMonth) || 0,
      isDefault: formData.isDefault,
    };

    if (editingId) {
      updateFeeStandard(editingId, data);
    } else {
      addFeeStandard(data);
    }

    setShowModal(false);
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData({ ...formData, customerId, contractId: '' });
  };

  const filteredContracts = contracts.filter((c) => !formData.customerId || c.customerId === formData.customerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">费用标准管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {filteredStandards.length} 条费用标准</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          新增费用标准
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">客户：</span>
            <select
              className="input w-44"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="">全部客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">合同：</span>
            <select
              className="input w-44"
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value)}
            >
              <option value="">全部合同</option>
              {contracts
                .filter((c) => !filterCustomer || c.customerId === filterCustomer)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.contractNo} - {c.customerName}</option>
                ))}
            </select>
          </div>
          {(filterCustomer || filterContract) && (
            <button
              className="btn-ghost btn-sm text-slate-500"
              onClick={() => { setFilterCustomer(''); setFilterContract(''); }}
            >
              <X className="w-3.5 h-3.5" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredStandards.map((fs) => {
          const scope = getScope(fs);
          const ScopeConfig = scopeMap[scope];
          const ScopeIcon = ScopeConfig.icon;
          const BasisIcon = feeBasisIconMap[fs.feeBasis];

          return (
            <div key={fs.id} className="card p-5 relative">
              {fs.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="badge badge-success">
                    <DollarSign className="w-3 h-3 mr-1" />
                    默认标准
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4 pr-24">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-serif">{fs.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('badge', ScopeConfig.cls)}>
                        <ScopeIcon className="w-3 h-3 mr-1" />
                        {ScopeConfig.label}
                      </span>
                      <span className="badge badge-slate">
                        <BasisIcon className="w-3 h-3 mr-1" />
                        {FEE_BASIS_MAP[fs.feeBasis]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {scope === 'customer' && fs.customerName && (
                <div className="mb-3 text-sm text-slate-600">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  适用客户：{fs.customerName}
                </div>
              )}
              {scope === 'contract' && fs.contractNo && (
                <div className="mb-3 text-sm text-slate-600">
                  <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  适用合同：{fs.contractNo}
                  {fs.customerName && `（${fs.customerName}）`}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 text-center">
                  <div className="text-lg font-bold text-primary-600 font-serif">¥{fs.feePerBox}</div>
                  <div className="text-[10px] text-slate-500">每盒/月</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 text-center">
                  <div className="text-lg font-bold text-primary-600 font-serif">¥{fs.feePerVolume}</div>
                  <div className="text-[10px] text-slate-500">每m³/月</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 text-center">
                  <div className="text-lg font-bold text-primary-600 font-serif">¥{fs.feePerWeight}</div>
                  <div className="text-[10px] text-slate-500">每kg/月</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 text-center">
                  <div className="text-lg font-bold text-accent-600 font-serif">¥{fs.accessFeePerTime}</div>
                  <div className="text-[10px] text-slate-500">调阅/次</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="p-3 rounded-lg bg-amber-50 text-center">
                  <div className="text-sm font-bold text-amber-600 font-serif">¥{fs.overdueFeePerDay}</div>
                  <div className="text-[10px] text-amber-500">逾期/天</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <div className="text-sm font-bold text-red-600 font-serif">¥{fs.destructionFeePerItem}</div>
                  <div className="text-[10px] text-red-500">销毁/件</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <div className="text-sm font-bold text-blue-600 font-serif">¥{fs.manualServiceFeePerHour}</div>
                  <div className="text-[10px] text-blue-500">人工/小时</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 text-center">
                  <div className="text-sm font-bold text-emerald-600 font-serif">¥{fs.minimumChargePerMonth}</div>
                  <div className="text-[10px] text-emerald-500">月最低收费</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  更新于 {fs.updatedAt}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => handleEdit(fs)}>
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button className="btn-ghost btn-sm text-red-500" onClick={() => handleDelete(fs.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStandards.length === 0 && (
        <div className="card p-12 text-center">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500">暂无费用标准</div>
          <div className="text-sm text-slate-400 mt-1">点击右上角"新增费用标准"创建</div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 font-serif">
                {editingId ? '编辑费用标准' : '新增费用标准'}
              </h2>
              <button className="btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">费用标准名称</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="如：标准VIP客户收费"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">适用客户（可选）</label>
                  <select
                    className="input w-full"
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                  >
                    <option value="">通用（所有客户）</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">适用合同（可选）</label>
                  <select
                    className="input w-full"
                    value={formData.contractId}
                    onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                    disabled={!formData.customerId && filteredContracts.length === 0}
                  >
                    <option value="">不指定合同</option>
                    {filteredContracts.map((c) => (
                      <option key={c.id} value={c.id}>{c.contractNo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">计费方式</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(FEE_BASIS_MAP) as FeeBasis[]).map((basis) => {
                    const Icon = feeBasisIconMap[basis];
                    return (
                      <label
                        key={basis}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                          formData.feeBasis === basis
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="feeBasis"
                          value={basis}
                          checked={formData.feeBasis === basis}
                          onChange={(e) => setFormData({ ...formData, feeBasis: e.target.value as FeeBasis })}
                          className="w-4 h-4 text-primary-600"
                        />
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{FEE_BASIS_MAP[basis]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">费用标准设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Box className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      每盒单价（元/月）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.feePerBox}
                      onChange={(e) => setFormData({ ...formData, feePerBox: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Package className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      每立方单价（元/m³/月）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.feePerVolume}
                      onChange={(e) => setFormData({ ...formData, feePerVolume: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Scale className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      每kg单价（元/kg/月）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.feePerWeight}
                      onChange={(e) => setFormData({ ...formData, feePerWeight: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      调阅服务费（元/次）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.accessFeePerTime}
                      onChange={(e) => setFormData({ ...formData, accessFeePerTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      逾期归还费（元/天）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.overdueFeePerDay}
                      onChange={(e) => setFormData({ ...formData, overdueFeePerDay: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      销毁服务费（元/件）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.destructionFeePerItem}
                      onChange={(e) => setFormData({ ...formData, destructionFeePerItem: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      人工服务费（元/小时）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.manualServiceFeePerHour}
                      onChange={(e) => setFormData({ ...formData, manualServiceFeePerHour: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      月最低收费（元）
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={formData.minimumChargePerMonth}
                      onChange={(e) => setFormData({ ...formData, minimumChargePerMonth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-slate-700">设为默认费用标准</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 ml-7">
                  当客户或合同未指定费用标准时，将使用默认标准
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Save className="w-4 h-4" />
                {editingId ? '保存修改' : '创建标准'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
