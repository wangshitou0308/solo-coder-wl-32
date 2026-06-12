import type {
  Customer,
  Contract,
  Warehouse,
  ShelfPosition,
  Archive,
  EnvironmentRecord,
  Accession,
  InventoryTask,
  InventoryStatus,
  DestructionRecord,
  Bill,
} from '@/types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const mockCustomers: Customer[] = [
  { id: 'c1', name: '华东建设集团有限公司', contactPerson: '张建国', contactPhone: '13800138001', address: '上海市浦东新区世纪大道100号', createdAt: '2024-01-15', archiveCount: 328, accessCount: 45 },
  { id: 'c2', name: '恒信医疗科技股份有限公司', contactPerson: '李梅', contactPhone: '13900139002', address: '北京市朝阳区望京SOHO塔2', createdAt: '2024-02-20', archiveCount: 512, accessCount: 78 },
  { id: 'c3', name: '金鼎财务管理咨询有限公司', contactPerson: '王海涛', contactPhone: '13700137003', address: '深圳市南山区科技园金融基地', createdAt: '2024-03-10', archiveCount: 186, accessCount: 32 },
  { id: 'c4', name: '远洋人力资源服务集团', contactPerson: '陈丽华', contactPhone: '13600136004', address: '广州市天河区珠江新城华夏路30号', createdAt: '2024-04-05', archiveCount: 445, accessCount: 61 },
  { id: 'c5', name: '蓝图工程设计研究院', contactPerson: '赵明', contactPhone: '13500135005', address: '杭州市西湖区文三路478号', createdAt: '2024-05-18', archiveCount: 267, accessCount: 29 },
  { id: 'c6', name: '信达律师事务所', contactPerson: '刘芳', contactPhone: '13400134006', address: '成都市锦江区春熙路IFS国际金融中心', createdAt: '2024-06-22', archiveCount: 143, accessCount: 56 },
];

export const mockContracts: Contract[] = [
  { id: 'ct1', customerId: 'c1', customerName: '华东建设集团有限公司', contractNo: 'HT-2024-001', startDate: '2024-01-15', endDate: '2027-01-14', maxBoxes: 500, feePerBox: 12, feePerVolume: 80, feePerWeight: 5, accessFeePerTime: 50, status: 'active' },
  { id: 'ct2', customerId: 'c2', customerName: '恒信医疗科技股份有限公司', contractNo: 'HT-2024-002', startDate: '2024-02-20', endDate: '2026-02-19', maxBoxes: 800, feePerBox: 10, feePerVolume: 75, feePerWeight: 4.5, accessFeePerTime: 45, status: 'active' },
  { id: 'ct3', customerId: 'c3', customerName: '金鼎财务管理咨询有限公司', contractNo: 'HT-2024-003', startDate: '2024-03-10', endDate: '2025-03-09', maxBoxes: 300, feePerBox: 15, feePerVolume: 90, feePerWeight: 6, accessFeePerTime: 60, status: 'active' },
  { id: 'ct4', customerId: 'c4', customerName: '远洋人力资源服务集团', contractNo: 'HT-2024-004', startDate: '2024-04-05', endDate: '2027-04-04', maxBoxes: 600, feePerBox: 11, feePerVolume: 85, feePerWeight: 5, accessFeePerTime: 55, status: 'active' },
  { id: 'ct5', customerId: 'c5', customerName: '蓝图工程设计研究院', contractNo: 'HT-2024-005', startDate: '2024-05-18', endDate: '2026-05-17', maxBoxes: 400, feePerBox: 13, feePerVolume: 88, feePerWeight: 5.5, accessFeePerTime: 50, status: 'active' },
  { id: 'ct6', customerId: 'c6', customerName: '信达律师事务所', contractNo: 'HT-2024-006', startDate: '2024-06-22', endDate: '2025-06-21', maxBoxes: 200, feePerBox: 14, feePerVolume: 92, feePerWeight: 5.8, accessFeePerTime: 65, status: 'active' },
];

export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: '一号库房（纸质档案）', code: 'WH-001', archiveType: 'paper', totalPositions: 400, usedPositions: 337, columns: 10, sidesPerColumn: 5, levelsPerSide: 8, status: 'warning' },
  { id: 'w2', name: '二号库房（纸质档案）', code: 'WH-002', archiveType: 'paper', totalPositions: 400, usedPositions: 178, columns: 10, sidesPerColumn: 5, levelsPerSide: 8, status: 'normal' },
  { id: 'w3', name: '三号库房（胶片档案）', code: 'WH-003', archiveType: 'film', totalPositions: 200, usedPositions: 129, columns: 8, sidesPerColumn: 5, levelsPerSide: 5, status: 'normal' },
  { id: 'w4', name: '四号库房（综合）', code: 'WH-004', archiveType: 'mixed', totalPositions: 300, usedPositions: 297, columns: 10, sidesPerColumn: 5, levelsPerSide: 6, status: 'full' },
];

function generateShelfPositions(): ShelfPosition[] {
  const positions: ShelfPosition[] = [];
  mockWarehouses.forEach((w) => {
    let idx = 0;
    for (let c = 1; c <= w.columns; c++) {
      for (let s = 1; s <= w.sidesPerColumn; s++) {
        for (let l = 1; l <= w.levelsPerSide; l++) {
          idx++;
          const occupiedSeed = (parseInt(w.id.slice(1)) * 1000 + idx) % 100;
          const occupied = occupiedSeed < (w.usedPositions / w.totalPositions) * 100;
          positions.push({
            id: `sp-${w.id}-${c}-${s}-${l}`,
            warehouseId: w.id,
            warehouseName: w.name,
            column: c,
            side: s,
            level: l,
            code: `${w.code}-${String(c).padStart(2, '0')}-${s}-${String(l).padStart(2, '0')}`,
            occupied,
          });
        }
      }
    }
  });
  return positions;
}
export const mockShelfPositions: ShelfPosition[] = generateShelfPositions();

const typeNames = [
  { type: 'finance' as const, name: '财务凭证', titles: ['2023年度记账凭证', '2024年Q1财务报表', '银行对账单存档', '税务申报资料'], meta: ['会计期间', '凭证编号', '制单人'] },
  { type: 'personnel' as const, name: '人事档案', titles: ['员工入职档案', '绩效考核记录', '劳动合同存档', '社保公积金资料'], meta: ['员工编号', '部门', '入职日期'] },
  { type: 'contract' as const, name: '合同档案', titles: ['采购合同正本', '销售协议', '服务合同', '战略合作框架'], meta: ['合同编号', '签订方', '签订日期'] },
  { type: 'engineering' as const, name: '工程图纸', titles: ['建筑施工图', '结构设计图', '机电管线图', '竣工图纸'], meta: ['项目编号', '图纸编号', '设计阶段'] },
  { type: 'medical' as const, name: '医疗病历', titles: ['住院病历档案', '门诊记录', '检查报告存档', '手术记录'], meta: ['病案号', '科室', '就诊日期'] },
  { type: 'other' as const, name: '其他档案', titles: ['会议纪要存档', '内部文件', '资质证书复印件', '公文书函'], meta: ['文件编号', '密级', '发文单位'] },
];

const retentions: Array<{ period: any; years: number | undefined }> = [
  { period: 'permanent', years: undefined },
  { period: '30years', years: 30 },
  { period: '10years', years: 10 },
  { period: '5years', years: 5 },
];

function buildArchives(): Archive[] {
  const list: Archive[] = [];
  const availablePositions = mockShelfPositions.filter(p => p.occupied).slice(0, 80);
  let idx = 0;
  for (const c of mockCustomers) {
    const count = Math.floor(Math.random() * 50) + 20;
    for (let i = 0; i < count; i++) {
      const t = typeNames[Math.floor(Math.random() * typeNames.length)];
      const ret = retentions[Math.floor(Math.random() * retentions.length)];
      const storageDate = addDays(today, -Math.floor(Math.random() * 700) - 30);
      const expiryYears = ret.years ?? 100;
      const expiryDate = new Date(storageDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + expiryYears);
      const isExpiring = Math.random() < 0.15;
      const finalExpiry = isExpiring ? addDays(today, Math.floor(Math.random() * 60) + 5) : expiryDate;
      const pos = availablePositions[idx % availablePositions.length];
      idx++;
      const statusRoll = Math.random();
      let status: Archive['status'] = 'in_stock';
      if (statusRoll < 0.05) status = 'out_reading';
      else if (statusRoll < 0.1) status = 'out_borrowed';
      else if (isExpiring && Math.random() < 0.3) status = 'pending_destroy';
      const meta: Record<string, string> = {};
      t.meta.forEach((m) => { meta[m] = `${m}-${Math.floor(Math.random() * 1000)}`; });
      list.push({
        id: `a${list.length + 1}`,
        barcode: `ARC${String(Date.now()).slice(-6)}${String(list.length + 1).padStart(4, '0')}`,
        customerId: c.id,
        customerName: c.name,
        type: t.type,
        typeName: t.name,
        title: t.titles[Math.floor(Math.random() * t.titles.length)],
        boxNo: `BOX-${String(c.id).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        volume: +(Math.random() * 0.5 + 0.1).toFixed(2),
        weight: +(Math.random() * 8 + 1).toFixed(1),
        retentionPeriod: ret.period,
        retentionYears: ret.years,
        storageDate: fmt(storageDate),
        expiryDate: fmt(finalExpiry),
        positionId: pos.id,
        positionCode: pos.code,
        warehouseId: pos.warehouseId,
        status,
        metadata: meta,
      });
    }
  }
  return list;
}
export const mockArchives: Archive[] = buildArchives();

function buildEnvRecords(): EnvironmentRecord[] {
  const records: EnvironmentRecord[] = [];
  mockWarehouses.forEach((w) => {
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      const isPaper = w.archiveType !== 'film';
      const baseT = isPaper ? 18 : 14;
      const baseH = isPaper ? 50 : 40;
      const temp = +(baseT + (Math.random() - 0.5) * 12).toFixed(1);
      const hum = +(baseH + (Math.random() - 0.5) * 25).toFixed(1);
      let abnormal = false;
      let risk: EnvironmentRecord['riskLevel'] = 'low';
      if (isPaper) {
        abnormal = temp < 14 || temp > 24 || hum < 45 || hum > 60;
      } else {
        abnormal = temp < 13 || temp > 15 || hum < 35 || hum > 45;
      }
      if (abnormal) {
        const deviate = (isPaper ? Math.abs(temp - 19) / 5 + Math.abs(hum - 52) / 7.5 : Math.abs(temp - 14) + Math.abs(hum - 40) / 5);
        risk = deviate > 2 ? 'high' : 'medium';
      }
      records.push({
        id: `env-${w.id}-${fmt(d)}`,
        warehouseId: w.id,
        warehouseName: w.name,
        recordDate: fmt(d),
        temperature: temp,
        humidity: hum,
        isAbnormal: abnormal,
        riskLevel: risk,
      });
    }
  });
  return records;
}
export const mockEnvRecords: EnvironmentRecord[] = buildEnvRecords();

function buildAccessions(): Accession[] {
  const list: Accession[] = [];
  const statuses: Accession['status'][] = ['pending', 'approved', 'outbound', 'in_reading', 'returned', 'overdue', 'returned'];
  for (let i = 0; i < 18; i++) {
    const c = mockCustomers[i % mockCustomers.length];
    const archives = mockArchives.filter(a => a.customerId === c.id).slice(0, 3);
    if (archives.length === 0) continue;
    const status = statuses[i % statuses.length];
    const created = addDays(today, -Math.floor(Math.random() * 30));
    const duration = [1, 3, 5, 7, 15][i % 5];
    const start = addDays(created, 1);
    const expected = addDays(start, duration);
    const actual = status === 'returned' ? fmt(addDays(expected, Math.floor(Math.random() * 3) - 1)) : undefined;
    const items = archives.map((a, idx) => ({
      id: `ai-${i}-${idx}`,
      accessionId: `acc${i + 1}`,
      archiveId: a.id,
      barcode: a.barcode,
      title: a.title,
      boxNo: a.boxNo,
      outboundTime: status !== 'pending' && status !== 'rejected' ? fmt(addDays(created, 1)) : undefined,
      readingConfirmTime: status === 'in_reading' || status === 'returned' ? fmt(addDays(created, 1)) : undefined,
      returnTime: actual,
      returnStatus: (status === 'returned' ? (Math.random() < 0.1 ? 'damaged' : 'normal') : 'normal') as any,
    }));
    list.push({
      id: `acc${i + 1}`,
      accessionNo: `DY${fmt(created).replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
      customerId: c.id,
      customerName: c.name,
      applicant: c.contactPerson,
      purpose: (['audit', 'reference', 'copy', 'borrow', 'litigation'] as const)[i % 5],
      purposeName: (['审计', '查阅', '复印', '借出', '诉讼'] as const)[i % 5],
      durationDays: duration,
      startTime: fmt(start),
      expectedReturnDate: fmt(expected),
      actualReturnDate: actual,
      status,
      items,
      createdAt: fmt(created),
    });
  }
  return list;
}
export const mockAccessions: Accession[] = buildAccessions();

function buildInventory(): InventoryTask[] {
  const list: InventoryTask[] = [];
  const taskNames = ['一号库房季度盘点', '恒信医疗档案专项盘点', 'A列架位核查', '二号库房半年盘点'];
  for (let i = 0; i < 4; i++) {
    const archives = mockArchives.slice(i * 25, i * 25 + 25);
    const status: InventoryTask['status'] = (['pending', 'in_progress', 'completed', 'in_progress'] as const)[i];
    const checkedCount = status === 'pending' ? 0 : status === 'completed' ? archives.length : Math.floor(archives.length * 0.6);
    const items = archives.map((a, idx) => {
      const s: InventoryStatus = idx < checkedCount
        ? (idx % 10 === 0 ? 'missing' : idx % 15 === 0 ? 'misplaced' : idx % 20 === 0 ? 'damaged' : 'normal')
        : 'pending';
      return {
        id: `it-${i}-${idx}`,
        taskId: `inv${i + 1}`,
        archiveId: a.id,
        barcode: a.barcode,
        title: a.title,
        expectedPosition: a.positionCode ?? '未知',
        actualPosition: s === 'normal' ? a.positionCode : s === 'misplaced' ? mockShelfPositions[(idx + 100) % mockShelfPositions.length].code : undefined,
        status: s,
        checkedAt: s !== 'pending' ? fmt(addDays(today, -i)) : undefined,
      };
    });
    const counts = items.reduce((acc, it) => {
      if (it.status !== 'pending') {
        acc[it.status]++;
      }
      return acc;
    }, { normal: 0, missing: 0, misplaced: 0, damaged: 0 });
    list.push({
      id: `inv${i + 1}`,
      taskNo: `PD${fmt(today).replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
      name: taskNames[i],
      type: (['by_warehouse', 'by_customer', 'by_position', 'by_warehouse'] as const)[i],
      scope: { warehouse: '一号库房', customer: '恒信医疗', range: 'A列1-5面' },
      totalCount: items.length,
      checkedCount,
      normalCount: counts.normal,
      missingCount: counts.missing,
      misplacedCount: counts.misplaced,
      damagedCount: counts.damaged,
      status,
      createdAt: fmt(addDays(today, -i - 2)),
      startedAt: status !== 'pending' ? fmt(addDays(today, -i - 1)) : undefined,
      completedAt: status === 'completed' ? fmt(today) : undefined,
      items,
    });
  }
  return list;
}
export const mockInventoryTasks: InventoryTask[] = buildInventory();

function buildDestructions(): DestructionRecord[] {
  const list: DestructionRecord[] = [];
  const pending = mockArchives.filter(a => a.status === 'pending_destroy').slice(0, 8);
  pending.forEach((a, i) => {
    const stage = i % 4;
    list.push({
      id: `des${i + 1}`,
      archiveId: a.id,
      barcode: a.barcode,
      title: a.title,
      customerId: a.customerId,
      customerName: a.customerName,
      applyDate: fmt(addDays(today, -10 - i)),
      customerApproved: stage > 0,
      customerApprover: stage > 0 ? mockCustomers.find(c => c.id === a.customerId)?.contactPerson : undefined,
      customerApproveDate: stage > 0 ? fmt(addDays(today, -8 - i)) : undefined,
      managerApproved: stage > 1,
      managerApprover: stage > 1 ? '档案中心王主任' : undefined,
      managerApproveDate: stage > 1 ? fmt(addDays(today, -6 - i)) : undefined,
      executeDate: stage > 2 ? fmt(addDays(today, -3 - i)) : undefined,
      destroyMethod: (['shred', 'pulping', 'burn', 'shred'] as const)[i % 4],
      supervisor: '李监销',
      status: (['pending_customer', 'pending_manager', 'approved', 'executed'] as const)[stage],
      metadataSummary: a.metadata,
    });
  });
  return list;
}
export const mockDestructions: DestructionRecord[] = buildDestructions();

function buildBills(): Bill[] {
  const list: Bill[] = [];
  const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  mockContracts.forEach((c, i) => {
    const storageFee = Math.floor((mockArchives.filter(a => a.customerId === c.customerId).length * c.feePerBox));
    const accessFee = (mockAccessions.filter(a => a.customerId === c.customerId).length * c.accessFeePerTime);
    const status: Bill['status'] = (['issued', 'paid', 'pending', 'overdue', 'paid', 'issued'] as const)[i];
    list.push({
      id: `b${i + 1}`,
      billNo: `ZF${period.replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
      contractId: c.id,
      customerId: c.customerId,
      customerName: c.customerName,
      period,
      storageFee,
      accessFee,
      totalAmount: storageFee + accessFee,
      status,
      issueDate: fmt(addDays(today, -5)),
      dueDate: fmt(addDays(today, 10)),
      paidDate: status === 'paid' ? fmt(addDays(today, -2)) : undefined,
    });
  });
  return list;
}
export const mockBills: Bill[] = buildBills();
