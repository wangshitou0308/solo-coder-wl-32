import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import ArchiveList from "@/pages/archives/ArchiveList";
import ArchiveNew from "@/pages/archives/ArchiveNew";
import WarehouseList from "@/pages/warehouses/WarehouseList";
import WarehouseDetail from "@/pages/warehouses/WarehouseDetail";
import EnvironmentMonitor from "@/pages/warehouses/EnvironmentMonitor";
import AccessionList from "@/pages/accessions/AccessionList";
import AccessionNew from "@/pages/accessions/AccessionNew";
import InventoryList from "@/pages/inventory/InventoryList";
import InventoryExecute from "@/pages/inventory/InventoryExecute";
import DestructionList from "@/pages/destruction/DestructionList";
import ContractList from "@/pages/contracts/ContractList";
import BillingList from "@/pages/billing/BillingList";
import CustomerList from "@/pages/customers/CustomerList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/archives" element={<ArchiveList />} />
          <Route path="/archives/new" element={<ArchiveNew />} />
          <Route path="/warehouses" element={<WarehouseList />} />
          <Route path="/warehouses/:id" element={<WarehouseDetail />} />
          <Route path="/warehouses/:id/environment" element={<EnvironmentMonitor />} />
          <Route path="/accessions" element={<AccessionList />} />
          <Route path="/accessions/new" element={<AccessionNew />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/:id" element={<InventoryExecute />} />
          <Route path="/destruction" element={<DestructionList />} />
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/billing" element={<BillingList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
