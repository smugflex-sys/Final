import React, { useState } from 'react';
import { Search, Filter, Archive, Bell, Trash2, Eye, Calendar, Users, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { useSchool } from '../../contexts/SchoolContext';

export function NotificationArchivesPage() {
  const { notifications } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Transform real notifications for display
  const notificationsData = notifications.map(n => {
    // Calculate read count based on readBy array
    const readCount = n.readBy.length;
    
    // Estimate recipient count based on target audience
    let recipientCount = 0;
    let recipientText = '';
    if (n.targetAudience === 'all') {
      recipientText = 'All Users';
      recipientCount = 500; // Estimated
    } else if (n.targetAudience === 'teachers') {
      recipientText = 'All Teachers';
      recipientCount = 50; // Estimated
    } else if (n.targetAudience === 'parents') {
      recipientText = 'All Parents';
      recipientCount = 300; // Estimated
    } else if (n.targetAudience === 'students') {
      recipientText = 'All Students';
      recipientCount = 400; // Estimated
    } else if (n.targetAudience === 'accountants') {
      recipientText = 'Accountants';
      recipientCount = 5; // Estimated
    }

    return {
      id: n.id.toString(),
      title: n.title,
      message: n.message,
      type: n.type === 'info' ? 'announcement' : n.type === 'warning' ? 'alert' : n.type === 'success' ? 'update' : 'reminder',
      recipient: recipientText,
      recipientCount,
      sentBy: 'Admin Office', // You can enhance this if you store sender info
      sentDate: new Date(n.sentDate).toLocaleDateString(),
      status: 'sent', // All notifications in archive are sent
      readCount
    };
  });

  const filteredNotifications = notificationsData.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: Notification['type']) => {
    switch (type) {
      case 'announcement':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Bell className="w-3 h-3 mr-1" />Announcement</Badge>;
      case 'alert':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><AlertCircle className="w-3 h-3 mr-1" />Alert</Badge>;
      case 'reminder':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Calendar className="w-3 h-3 mr-1" />Reminder</Badge>;
      case 'update':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><MessageSquare className="w-3 h-3 mr-1" />Update</Badge>;
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => parseInt(n.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} notification(s)?`)) {
      setSelectedIds([]);
      // In a real app, this would delete the notifications
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0A2540] mb-2">Notification Archives</h1>
          <p className="text-gray-600">View and manage all sent notifications</p>
        </div>
        {selectedIds.length > 0 && (
          <Button 
            onClick={handleBulkDelete}
            variant="destructive"
            className="rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedIds.length} Selected
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Sent</p>
                <p className="text-[#0A2540]">{notificationsData.filter(n => n.status === 'sent').length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Announcements</p>
                <p className="text-[#0A2540]">{notificationsData.filter(n => n.type === 'announcement').length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Alerts</p>
                <p className="text-[#0A2540]">{notificationsData.filter(n => n.type === 'alert').length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Recipients</p>
                <p className="text-[#0A2540]">{notificationsData.reduce((sum, n) => sum + n.recipientCount, 0)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-[#0A2540]/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#0A2540]/20 focus:border-[#FFD700] rounded-xl"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-[#0A2540]/20 rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-[#0A2540]/20 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card className="border-[#0A2540]/10">
        <CardHeader className="border-b border-[#0A2540]/10 bg-[#0A2540]/5">
          <CardTitle className="text-[#0A2540]">Archived Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#0A2540]/5">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-[#0A2540]">Title</TableHead>
                  <TableHead className="text-[#0A2540]">Type</TableHead>
                  <TableHead className="text-[#0A2540]">Recipient</TableHead>
                  <TableHead className="text-[#0A2540]">Sent By</TableHead>
                  <TableHead className="text-[#0A2540]">Date</TableHead>
                  <TableHead className="text-[#0A2540]">Read Rate</TableHead>
                  <TableHead className="text-[#0A2540]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} className="hover:bg-[#0A2540]/5">
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(parseInt(notification.id))}
                          onCheckedChange={() => toggleSelection(parseInt(notification.id))}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-[#0A2540]">{notification.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-[#0A2540]">{notification.recipient}</p>
                          <p className="text-sm text-gray-500">{notification.recipientCount} recipients</p>
                        </div>
                      </TableCell>
                      <TableCell>{notification.sentBy}</TableCell>
                      <TableCell>{notification.sentDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#FFD700] h-2 rounded-full" 
                              style={{ width: `${(notification.readCount / notification.recipientCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((notification.readCount / notification.recipientCount) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNotification(notification)}
                          className="text-[#0A2540] hover:text-[#FFD700] hover:bg-[#FFD700]/10 rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Notification Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540]">{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              Sent to {selectedNotification?.recipient} on {selectedNotification && new Date(selectedNotification.sentDate).toLocaleDateString('en-GB')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              {selectedNotification && getTypeBadge(selectedNotification.type)}
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification?.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Sent By:</p>
                <p className="text-[#0A2540]">{selectedNotification?.sentBy}</p>
              </div>
              <div>
                <p className="text-gray-600">Recipients:</p>
                <p className="text-[#0A2540]">{selectedNotification?.recipientCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Read Count:</p>
                <p className="text-[#0A2540]">{selectedNotification?.readCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Read Rate:</p>
                <p className="text-[#0A2540]">
                  {selectedNotification && Math.round((selectedNotification.readCount / selectedNotification.recipientCount) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}