import { useState } from 'react';
import { Bell, MessageSquare, Calendar, User, Check, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useSchool } from '../../contexts/SchoolContext';
import { toast } from 'sonner';

export function ViewNotificationsPage() {
  const { notifications, currentUser, markNotificationAsRead } = useSchool();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Filter notifications for the current user based on their role
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return false;
    
    // Check if notification targets the user's role
    const targetsUser = 
      n.targetAudience === 'all' ||
      n.targetAudience === currentUser.role ||
      (currentUser.role === 'admin' && (n.targetAudience as any) === 'admin') ||
      (currentUser.role === 'accountant' && n.targetAudience === 'accountants') ||
      (currentUser.role === 'teacher' && n.targetAudience === 'teachers') ||
      (currentUser.role === 'parent' && n.targetAudience === 'parents');
    
    return targetsUser;
  });

  // Sort by date (newest first)
  const sortedNotifications = userNotifications.sort((a, b) => 
    new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
  );

  // Check if notification is read by current user
  const isNotificationRead = (notification: any) => {
    return notification.readBy.includes(currentUser?.id || 0);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId, currentUser?.id || 0);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  // Get notification type badge
  const getNotificationBadge = (type: string, targetAudience: string) => {
    // Check if it's a parent message
    if ((type as any) === 'message' && (targetAudience as any) === 'admin') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300"><MessageSquare className="w-3 h-3 mr-1" />Parent Message</Badge>;
    }
    
    switch (type) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Bell className="w-3 h-3 mr-1" />Information</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Bell className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><X className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300"><Bell className="w-3 h-3 mr-1" />Notification</Badge>;
    }
  };

  // Get recipient text
  const getRecipientText = (targetAudience: string) => {
    switch (targetAudience) {
      case 'all': return 'All Users';
      case 'admin': return 'Admin Only';
      case 'accountants': return 'Accountants';
      case 'teachers': return 'Teachers';
      case 'parents': return 'Parents';
      case 'students': return 'Students';
      default: return targetAudience;
    }
  };

  const unreadCount = userNotifications.filter(n => !isNotificationRead(n)).length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Notifications</h1>
        <p className="text-[#6B7280]">
          {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
        </p>
      </div>

      {/* Unread Notifications */}
      {unreadCount > 0 && (
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <CardTitle className="text-[#1F2937] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Unread Notifications ({unreadCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {sortedNotifications.filter(n => !isNotificationRead(n)).map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getNotificationBadge(notification.type, notification.targetAudience)}
                      <span className="text-xs text-gray-500">
                        {new Date(notification.sentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#1F2937] mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Read
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Notifications */}
      <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <CardTitle className="text-[#1F2937] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            All Notifications ({userNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {sortedNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isNotificationRead(notification) 
                      ? 'bg-white border-gray-200 hover:bg-gray-50' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationBadge(notification.type, notification.targetAudience)}
                        <span className="text-xs text-gray-500">
                          {new Date(notification.sentDate).toLocaleDateString()}
                        </span>
                        {!isNotificationRead(notification) && (
                          <Badge className="bg-blue-500 text-white border-0">New</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-[#1F2937] mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          To: {getRecipientText(notification.targetAudience)}
                        </span>
                      </div>
                    </div>
                    {!isNotificationRead(notification) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="flex-shrink-0"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1F2937]">{selectedNotification.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotification(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {getNotificationBadge(selectedNotification.type, selectedNotification.targetAudience)}
                <span className="text-sm text-gray-500">
                  {new Date(selectedNotification.sentDate).toLocaleDateString()} at {new Date(selectedNotification.sentDate).toLocaleTimeString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#1F2937] mb-2">Message:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Sent To:</p>
                    <p className="text-[#1F2937]">{getRecipientText(selectedNotification.targetAudience)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="text-[#1F2937]">
                      {isNotificationRead(selectedNotification) ? 'Read' : 'Unread'}
                    </p>
                  </div>
                </div>
                {!isNotificationRead(selectedNotification) && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleMarkAsRead(selectedNotification.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNotification(null)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
