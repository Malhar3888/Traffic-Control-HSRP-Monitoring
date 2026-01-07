import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { getAllViolations, updateViolation } from '@/db/api';
import type { Violation, ViolationFilters } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [filters, setFilters] = useState<ViolationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();

  const canManage = profile?.role === 'admin' || profile?.role === 'officer';

  useEffect(() => {
    loadViolations();
  }, [filters]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      const data = await getAllViolations(filters);
      setViolations(data);
    } catch (error) {
      console.error('Failed to load violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, plateNumber: searchQuery || undefined });
  };

  const handleStatusChange = async (violationId: string, newStatus: string) => {
    try {
      await updateViolation(violationId, { status: newStatus as any });
      loadViolations();
    } catch (error) {
      console.error('Failed to update violation status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getViolationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      no_hsrp: 'No HSRP',
      insurance_expired: 'Insurance Expired',
      puc_expired: 'PUC Expired',
      rc_expired: 'RC Expired',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      notified: { variant: 'default', icon: <AlertTriangle className="w-3 h-3" /> },
      paid: { variant: 'outline', icon: <CheckCircle className="w-3 h-3" /> },
      dismissed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Plate Number', 'Type', 'Location', 'Date', 'Fine Amount', 'Status'];
    const rows = violations.map(v => [
      v.plate_number,
      getViolationTypeLabel(v.violation_type),
      v.location,
      new Date(v.violation_date).toLocaleString('en-IN'),
      v.fine_amount,
      v.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Violations</h1>
          <p className="text-muted-foreground">Manage and track traffic violations</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-5">
            <div className="xl:col-span-2 flex gap-2">
              <Input
                placeholder="Search by plate number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="notified">Notified</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="no_hsrp">No HSRP</SelectItem>
                <SelectItem value="insurance_expired">Insurance Expired</SelectItem>
                <SelectItem value="puc_expired">PUC Expired</SelectItem>
                <SelectItem value="rc_expired">RC Expired</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Records</CardTitle>
          <CardDescription>
            {violations.length} violation{violations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted" />
              ))}
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No violations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Fine Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium">{violation.plate_number}</TableCell>
                      <TableCell>{getViolationTypeLabel(violation.violation_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{violation.location}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(violation.violation_date).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(violation.fine_amount)}</TableCell>
                      <TableCell>{getStatusBadge(violation.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedViolation(violation)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violation Detail Dialog */}
      <Dialog open={!!selectedViolation} onOpenChange={() => setSelectedViolation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Violation Details</DialogTitle>
            <DialogDescription>
              Complete information about the violation
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plate Number</p>
                  <p className="font-semibold text-lg">{selectedViolation.plate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedViolation.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Violation Type</p>
                  <p className="font-medium">{getViolationTypeLabel(selectedViolation.violation_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fine Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(selectedViolation.fine_amount)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{selectedViolation.location}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(selectedViolation.violation_date).toLocaleString('en-IN')}
                </p>
              </div>

              {selectedViolation.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedViolation.description}</p>
                </div>
              )}

              {selectedViolation.vehicle && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-2">Vehicle Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Owner Name</p>
                      <p className="font-medium">{selectedViolation.vehicle.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Owner Phone</p>
                      <p className="font-medium">{selectedViolation.vehicle.owner_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Type</p>
                      <p className="font-medium capitalize">{selectedViolation.vehicle.vehicle_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">HSRP Status</p>
                      <Badge variant={selectedViolation.vehicle.has_hsrp ? 'outline' : 'destructive'}>
                        {selectedViolation.vehicle.has_hsrp ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {canManage && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-2">Update Status</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedViolation.id, 'notified')}
                      disabled={selectedViolation.status === 'notified'}
                    >
                      Mark Notified
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedViolation.id, 'paid')}
                      disabled={selectedViolation.status === 'paid'}
                    >
                      Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedViolation.id, 'dismissed')}
                      disabled={selectedViolation.status === 'dismissed'}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
