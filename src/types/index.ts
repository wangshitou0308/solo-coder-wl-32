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
export type BillStatus = 'pending' | 'issued' | 'paid' | 'overdue';
export type ContractStatus = 'active' | 'expired' | 'terminated';
export type WarehouseStatus = 'normal' | 'warning' | 'full';
export type ArchiveTypeCategory = 'paper' | 'film' | 'mixed';
export type RiskLevel = 'low' | 'medium' | 'high';

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
  totalAmount: number;
  status: BillStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
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
  payBill: (id: string) => void;
  moveArchive: (archiveId: string, newPositionId: string) => void;
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
