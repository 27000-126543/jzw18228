import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import ApplicationNew from "@/pages/ApplicationNew";
import ApplicationDetail from "@/pages/ApplicationDetail";
import Approvals from "@/pages/Approvals";
import Bookings from "@/pages/Bookings";
import Expenses from "@/pages/Expenses";
import Settlements from "@/pages/Settlements";
import Analytics from "@/pages/Analytics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<ApplicationNew />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}
