"use client";

import { useEffect, useState } from "react";
import { Search, Eye, MoreHorizontal, AlertTriangle, Shield, X, Clock, User, Activity } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDataStore } from "@/store/useDataStore";
import { formatDistanceToNow } from "date-fns";

interface BehavioralSessionsTableProps {
  userId?: string;
}

export function BehavioralSessionsTable({ userId }: BehavioralSessionsTableProps) {
  const {
    raw_behavioral_sessions,
    raw_behavioral_sessionsCache,
    setRaw_behavioral_sessionsPagination,
    setRaw_behavioral_sessionsFilters,
    setRaw_behavioral_sessionsSort,
    loadRaw_behavioral_sessions,
    resetFilters,
  } = useDataStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    loadRaw_behavioral_sessions();
  }, [loadRaw_behavioral_sessions]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setRaw_behavioral_sessionsFilters({ search: searchTerm || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, setRaw_behavioral_sessionsFilters]);

  // Handle status filter
  useEffect(() => {
    setRaw_behavioral_sessionsFilters({ status: statusFilter === 'all' ? undefined : statusFilter || undefined });
  }, [statusFilter, setRaw_behavioral_sessionsFilters]);

  // Handle risk level filter (using type field)
  useEffect(() => {
    setRaw_behavioral_sessionsFilters({ type: riskLevelFilter === 'all' ? undefined : riskLevelFilter || undefined });
  }, [riskLevelFilter, setRaw_behavioral_sessionsFilters]);

  const handlePageChange = (page: number) => {
    setRaw_behavioral_sessionsPagination({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setRaw_behavioral_sessionsPagination({ pageSize, page: 1 });
  };

  const handleSort = (field: string) => {
    const currentSort = raw_behavioral_sessions.sort;
    const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    setRaw_behavioral_sessionsSort(field, direction);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setRiskLevelFilter("");
    resetFilters('raw_behavioral_sessions');
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { variant: "default" as const, color: "bg-green-100 text-green-800", icon: Shield },
      medium: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      high: { variant: "destructive" as const, color: "bg-red-100 text-red-800", icon: AlertTriangle },
      critical: { variant: "destructive" as const, color: "bg-red-200 text-red-900", icon: AlertTriangle },
    };

    const config = riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.medium;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      completed: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      flagged: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      reviewing: { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!startTime) return 'N/A';
    
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return 'Invalid date';
    
    const end = endTime ? new Date(endTime) : new Date();
    if (endTime && isNaN(end.getTime())) return 'Invalid date';
    
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return '0m';
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const hasActiveFilters = searchTerm || statusFilter || riskLevelFilter;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Behavioral Sessions</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {raw_behavioral_sessions.ui.error && (
          <Alert className="mb-4">
            <AlertDescription>{raw_behavioral_sessions.ui.error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {raw_behavioral_sessions.ui.isLoading && !raw_behavioral_sessionsCache && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        )}

        {/* Sessions Grid */}
        {!raw_behavioral_sessions.ui.isLoading || raw_behavioral_sessionsCache ? (
          <>
            <div className="space-y-4">
              {raw_behavioral_sessionsCache?.data.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                    <p className="text-muted-foreground">
                      Behavioral sessions will appear here once users start interacting with the system.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                raw_behavioral_sessionsCache?.data.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  {session.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="font-medium">{session.user?.name || 'Unknown'}</div>
                                  <div className="text-sm text-gray-500">{session.user?.email}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">#{session.id}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(session.startTime)}</span>
                            </div>
                            <div>
                              Duration: {formatDuration(session.startTime, session.endTime)}
                            </div>
                            <div>
                              Actions: {session.actionsCount || 0}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getRiskLevelBadge(session.riskLevel || 'medium')}
                          {getStatusBadge(session.status || 'active')}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/behavioral-sessions/${session.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${session.userId}`}>
                                  View User Profile
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {raw_behavioral_sessionsCache && raw_behavioral_sessionsCache.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing {((raw_behavioral_sessionsCache.pagination.currentPage - 1) * raw_behavioral_sessionsCache.pagination.pageSize) + 1} to{' '}
                    {Math.min(
                      raw_behavioral_sessionsCache.pagination.currentPage * raw_behavioral_sessionsCache.pagination.pageSize,
                      raw_behavioral_sessionsCache.pagination.totalItems
                    )}{' '}
                    of {raw_behavioral_sessionsCache.pagination.totalItems} results
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={raw_behavioral_sessions.pagination.pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(raw_behavioral_sessionsCache.pagination.currentPage - 1)}
                      disabled={!raw_behavioral_sessionsCache.pagination.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm px-3">
                      Page {raw_behavioral_sessionsCache.pagination.currentPage} of {raw_behavioral_sessionsCache.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(raw_behavioral_sessionsCache.pagination.currentPage + 1)}
                      disabled={!raw_behavioral_sessionsCache.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}