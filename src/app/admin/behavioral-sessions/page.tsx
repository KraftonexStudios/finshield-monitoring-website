import { BehavioralSessionsTable } from "@/components/admin/behavioral-sessions-table";

export default function BehavioralSessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Behavioral Sessions</h1>
      </div>
      
      <BehavioralSessionsTable />
    </div>
  );
}