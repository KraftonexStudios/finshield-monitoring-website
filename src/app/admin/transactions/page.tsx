import { TransactionsTable } from "@/components/admin/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="text-sm text-gray-500">
          Server-side paginated transactions
        </div>
      </div>
      
      <TransactionsTable />
    </div>
  );
}