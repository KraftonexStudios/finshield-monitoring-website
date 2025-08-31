"use client";

import { Users, CreditCard, Activity, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalBehavioralSessions: number;
    userGrowth: Array<{ month: string; users: number }>;
    transactionTrends: Array<{ month: string; amount: number; count: number }>;
    appVersions: Array<{ version: string; count: number; percentage: number }>;
    recentUsers: Array<any>;
    recentTransactions: Array<any>;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth - 1 >= 0 ? currentMonth - 1 : 11;
  
  // Calculate growth percentages
  const userGrowthPercentage = stats.userGrowth.length >= 2 
    ? ((stats.userGrowth[stats.userGrowth.length - 1]?.users - stats.userGrowth[stats.userGrowth.length - 2]?.users) / stats.userGrowth[stats.userGrowth.length - 2]?.users * 100)
    : 0;

  const transactionGrowthPercentage = stats.transactionTrends.length >= 2
    ? ((stats.transactionTrends[stats.transactionTrends.length - 1]?.count - stats.transactionTrends[stats.transactionTrends.length - 2]?.count) / stats.transactionTrends[stats.transactionTrends.length - 2]?.count * 100)
    : 0;

  const activeUserPercentage = (stats.activeUsers / stats.totalUsers) * 100;

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${userGrowthPercentage.toFixed(1)}%`,
      changeType: userGrowthPercentage >= 0 ? "positive" : "negative",
      icon: Users,
      description: `${stats.activeUsers.toLocaleString()} active users (${activeUserPercentage.toFixed(1)}%)`
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      change: `+${transactionGrowthPercentage.toFixed(1)}%`,
      changeType: transactionGrowthPercentage >= 0 ? "positive" : "negative",
      icon: CreditCard,
      description: "This month"
    },
    {
      title: "Behavioral Sessions",
      value: stats.totalBehavioralSessions.toLocaleString(),
      change: "+12.3%",
      changeType: "positive",
      icon: Activity,
      description: "Security analysis data"
    },
    {
      title: "App Versions",
      value: stats.appVersions.length.toString(),
      change: stats.appVersions[0]?.version || "N/A",
      changeType: "neutral",
      icon: Smartphone,
      description: "Latest version usage"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={card.changeType === "positive" ? "default" : card.changeType === "negative" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {card.change}
                </Badge>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}