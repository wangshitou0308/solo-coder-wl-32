export type ArchiveType = 'finance' | 'personnel' | 'contract' | 'engineering' | 'medical' | 'other';
export type RetentionPeriod = 'permanent' | '30years' | '10years' | '5years' | 'custom';
export type ArchiveStatus = 'in_stock' | 'out_reading' | 'out_borrowed' | 'inventory' | 'destroyed' | 'pending_destroy';
export type AccessionPurpose = 'audit' | 'litigation' | 'reference' | 'copy' | 'borrow';
export type AccessionStatus = 'pending' | 'approved' | 'rejected' | 'outbound' | 'in_reading' | 'returned' | 'overdue';
export type ReturnStatus = 'normal' | 'damaged' | 'missing';
export type InventoryStatus = 'pending' | 'normal' | 'missing' | 'misplaced' | 'damaged';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskType = 'by_warehouse' | 'by_customer' | 'by_position';
export type DestructionStatus = 'pending_customer' | 'pending_manager' | 'approved' | 'executed' | 'rejected';
export type DestroyMethod = 'shred' | 'burn' | 'pulping' | 'other';
export type BillStatus = 'pending' | 'issued' | 'partial_paid' | 'paid' | 'overdue';
export type ContractStatus = 'active' | 'expired' | 'terminated';
export type WarehouseStatus = 'normal' | 'warning' | 'full';
export type ArchiveTypeCategory = 'paper' | 'film' | 'mixed';
export type RiskLevel = 'low' | 'medium' | 'high';
export type FeeBasis = 'box' | 'volume' | 'weight';
export type BillItemType = 'storage' | 'access' | 'overdue' | 'destruction' | 'manual';
export type ExportType = 'archive_list' | 'customer_list' | 'accession_records' | 'inventory_report' | 'destruction_certificate' | 'bill_details';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  createdAt: string;
  archiveCount: number;
  accessCount: number;
}

export interface FeeStandard {
  id: string;
  name: string;
  customerId?: string;
  customerName?: string;
  contractId?: string;
  contractNo?: string;
  feeBasis: FeeBasis;
  feePerBox: number;
  feePerVolume: number;
  feePerWeight: number;
  accessFeePerTime: number;
  overdueFeePerDay: number;
  destructionFeePerItem: number;
  manualServiceFeePerHour: number;
  minimumChargePerMonth: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  billId: string;
  billNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  remark?: string;
  createdAt: string;
}

export interface BillItem {
  id: string;
  billId: string;
  itemType: BillItemType;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remark?: string;
}

export interface ExportTask {
  id: string;
  type: ExportType;
  typeName: string;
  status: ExportStatus;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  params: Record<string, string>;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  maxBoxes: number;
  feePerBox: number;
  feePerVolume: number;
  feePerWeight: number;
  accessFeePerTime: number;
  overdueFeePerDay: number;
  destructionFeePerItem: number;
  manualServiceFeePerHour: number;
  minimumChargePerMonth: number;
  feeBasis: FeeBasis;
  feeStandardId?: string;
  originalContractId?: string;
  status: ContractStatus;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  archiveType: ArchiveTypeCategory;
  totalPositions: number;
  usedPositions: number;
  columns: number;
  sidesPerColumn: number;
  levelsPerSide: number;
  status: WarehouseStatus;
}

export interface ShelfPosition {
  id: string;
  warehouseId: string;
  warehouseName: string;
  column: number;
  side: number;
  level: number;
  code: string;
  occupied: boolean;
  archiveId?: string;
}

export interface Archive {
  id: string;
  barcode: string;
  customerId: string;
  customerName: string;
  type: ArchiveType;
  typeName: string;
  title: string;
  boxNo: string;
  volume: number;
  weight: number;
  retentionPeriod: RetentionPeriod;
  retentionYears?: number;
  storageDate: string;
  expiryDate: string;
  positionId?: string;
  positionCode?: string;
  warehouseId?: string;
  status: ArchiveStatus;
  metadata: Record<string, string>;
}

export interface EnvironmentRecord {
  id: string;
  warehouseId: string;
  warehouseName: string;
  recordDate: string;
  temperature: number;
  humidity: number;
  isAbnormal: boolean;
  riskLevel: RiskLevel;
}

export interface AccessionItem {
  id: string;
  accessionId: string;
  archiveId: string;
  barcode: string;
  title: string;
  boxNo: string;
  outboundTime?: string;
  readingConfirmTime?: string;
  returnTime?: string;
  returnStatus: ReturnStatus;
}

export interface Accession {
  id: string;
  accessionNo: string;
  customerId: string;
  customerName: string;
  applicant: string;
  purpose: AccessionPurpose;
  purposeName: string;
  durationDays: number;
  startTime: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: AccessionStatus;
  items: AccessionItem[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  taskId: string;
  archiveId: string;
  barcode: string;
  title: string;
  expectedPosition: string;
  actualPosition?: string;
  status: InventoryStatus;
  checkedAt?: string;
}

export interface InventoryTask {
  id: string;
  taskNo: string;
  name: string;
  type: TaskType;
  scope: Record<string, string>;
  totalCount: number;
  checkedCount: number;
  normalCount: number;
  missingCount: number;
  misplacedCount: number;
  damagedCount: number;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  items: InventoryItem[];
}

export interface DestructionRecord {
  id: string;
  archiveId: string;
  barcode: string;
  title: string;
  customerId: string;
  customerName: string;
  applyDate: string;
  customerApproved: boolean;
  customerApprover?: string;
  customerApproveDate?: string;
  managerApproved: boolean;
  managerApprover?: string;
  managerApproveDate?: string;
  executeDate?: string;
  destroyMethod: DestroyMethod;
  supervisor: string;
  status: DestructionStatus;
  metadataSummary: Record<string, string>;
}

export interface Bill {
  id: string;
  billNo: string;
  contractId: string;
  customerId: string;
  customerName: string;
  period: string;
  storageFee: number;
  accessFee: number;
  overdueFee: number;
  destructionFee: number;
  manualServiceFee: number;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: BillItem[];
}

export interface AppState {
  customers: Customer[];
  contracts: Contract[];
  warehouses: Warehouse[];
  shelfPositions: ShelfPosition[];
  archives: Archive[];
  environmentRecords: EnvironmentRecord[];
  accessions: Accession[];
  inventoryTasks: InventoryTask[];
  destructions: DestructionRecord[];
  bills: Bill[];
  feeStandards: FeeStandard[];
  paymentRecords: PaymentRecord[];
  exportTasks: ExportTask[];

  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'archiveCount' | 'accessCount'>) => void;
  addArchive: (data: Omit<Archive, 'id' | 'barcode'>) => void;
  updateArchiveStatus: (id: string, status: ArchiveStatus) => void;
  addAccession: (data: Omit<Accession, 'id' | 'accessionNo' | 'createdAt' | 'status'> & { items: Omit<AccessionItem, 'id' | 'accessionId' | 'returnStatus'>[] }) => void;
  approveAccession: (id: string) => void;
  rejectAccession: (id: string) => void;
  outboundAccession: (id: string) => void;
  confirmReading: (id: string, itemId: string) => void;
  returnAccession: (id: string) => void;
  addInventoryTask: (data: Omit<InventoryTask, 'id' | 'taskNo' | 'createdAt' | 'status' | 'checkedCount' | 'normalCount' | 'missingCount' | 'misplacedCount' | 'damagedCount'> & { items: Omit<InventoryItem, 'id' | 'taskId' | 'status'>[] }) => void;
  updateInventoryItem: (taskId: string, itemId: string, status: InventoryStatus, actualPosition?: string) => void;
  completeInventoryTask: (id: string) => void;
  addDestruction: (data: Omit<DestructionRecord, 'id' | 'applyDate' | 'customerApproved' | 'managerApproved' | 'status'>) => void;
  approveDestructionByCustomer: (id: string, approver: string) => void;
  approveDestructionByManager: (id: string, approver: string) => void;
  executeDestruction: (id: string, executeDate: string) => void;
  addEnvironmentRecord: (data: Omit<EnvironmentRecord, 'id' | 'isAbnormal' | 'riskLevel'>) => void;
  generateBill: (period: string) => void;
  payBill: (id: string, amount: number, paymentMethod: string, remark?: string) => void;
  moveArchive: (archiveId: string, newPositionId: string) => void;
  addFeeStandard: (data: Omit<FeeStandard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFeeStandard: (id: string, data: Partial<FeeStandard>) => void;
  deleteFeeStandard: (id: string) => void;
  renewContract: (contractId: string, newStartDate: string, newEndDate: string) => Contract | undefined;
  createExportTask: (type: ExportType, params: Record<string, string>) => void;
  downloadExport: (taskId: string) => void;
}

export const ARCHIVE_TYPE_MAP: Record<ArchiveType, string> = {
  finance: '财务凭证',
  personnel: '人事档案',
  contract: '合同档案',
  engineering: '工程图纸',
  medical: '医疗病历',
  other: '其他档案',
};

export const PURPOSE_MAP: Record<AccessionPurpose, string> = {
  audit: '审计',
  litigation: '诉讼',
  reference: '查阅',
  copy: '复印',
  borrow: '借出',
};

export const RETENTION_MAP: Record<RetentionPeriod, string> = {
  permanent: '永久',
  '30years': '30年',
  '10years': '10年',
  '5years': '5年',
  custom: '自定义',
};

export const FEE_BASIS_MAP: Record<FeeBasis, string> = {
  box: '按盒计费',
  volume: '按体积计费',
  weight: '按重量计费',
};

export const BILL_ITEM_TYPE_MAP: Record<BillItemType, string> = {
  storage: '寄存费',
  access: '调阅费',
  overdue: '逾期费',
  destruction: '销毁服务费',
  manual: '人工服务费',
};

export const BILL_STATUS_MAP: Record<BillStatus, string> = {
  pending: '待生成',
  issued: '已开票',
  partial_paid: '部分收款',
  paid: '已收款',
  overdue: '已逾期',
};

export const EXPORT_TYPE_MAP: Record<ExportType, string> = {
  archive_list: '档案清单',
  customer_list: '客户清单',
  accession_records: '调阅记录',
  inventory_report: '盘点报告',
  destruction_certificate: '销毁证明',
  bill_details: '账单明细',
};

export const EXPORT_STATUS_MAP: Record<ExportStatus, string> = {
  pending: '等待中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
};
