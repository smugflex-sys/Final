import { useState } from "react";
import { LayoutDashboard, Users, FileText, CreditCard, Receipt, Bell, LogOut, Download, Upload, User, GraduationCap, Lock, Calendar, Clock, CheckCircle } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { PerformanceReportsPage } from "./parent/PerformanceReportsPage";
import { ViewResultsPage } from "./parent/ViewResultsPage";
import { PayFeePage } from "./parent/PayFeePage";
import { ViewAttendancePage } from "./parent/ViewAttendancePage";
import { ViewExamTimetablePage } from "./shared/ViewExamTimetablePage";
import { ChangePasswordPage } from "./ChangePasswordPage";
import { NotificationsPage } from "./NotificationsPage";
import { StudentResultSheet } from "./StudentResultSheet";
import { MyChildrenPage } from "./parent/MyChildrenPage";
import { useSchool } from "../contexts/SchoolContext";

interface ParentDashboardProps {
  onLogout: () => void;
}

interface Child {
  id: number;
  name: string;
  class: string;
  balance: number;
  photo: string;
  totalFee: number;
}

export function ParentDashboard({ onLogout }: ParentDashboardProps) {
  const { 
    currentUser, 
    parents, 
    getParentChildren,
    getParentPermissions,
    getUnreadNotifications, 
    notifications, 
    getStudentFeeBalance, 
    currentTerm, 
    currentAcademicYear,
    createPaymentAPI,
    loadPaymentsFromAPI
  } = useSchool();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Get current parent
  const currentParent = currentUser ? parents.find((p) => p.id === currentUser.linked_id) : null;
  const parentName = currentParent ? `${currentParent.firstName} ${currentParent.lastName}` : 'Parent';
  
  // Get unread notifications count
  const unreadCount = currentUser ? getUnreadNotifications(currentUser.id, currentUser.role).length : 0;

  // Get parent's children using enhanced system
  const parentChildren = currentParent ? getParentChildren(currentParent.id) : [];
  
  const parentPermissions = currentParent ? getParentPermissions(currentParent.id) : {
    canViewResults: false,
    canViewAttendance: false,
    canMakePayments: false,
    canViewReports: false,
    canViewTimetable: false,
    childrenCount: 0,
    hasFinancialObligations: false,
    totalOutstandingBalance: 0
  };

  // Convert to Child interface format
  const children: Child[] = parentChildren.map(child => ({
    id: child.id,
    name: child.fullName,
    class: child.className,
    balance: child.feeBalance,
    photo: child.photoUrl || "",
    totalFee: child.totalFees,
  }));

  // Get recent fee payment notifications
  const feeNotifications = notifications
    .filter(n => n.targetAudience === 'parents' && n.title.includes('Fee Payment'))
    .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
    .slice(0, 5);

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", id: "dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "My Children", id: "my-children" },
    { icon: <FileText className="w-5 h-5" />, label: "View Results", id: "view-results" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Pay Fees", id: "pay-fees" },
    { icon: <Clock className="w-5 h-5" />, label: "View Attendance", id: "view-attendance" },
    { icon: <Calendar className="w-5 h-5" />, label: "Exam Timetable", id: "exam-timetable" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", id: "notifications" },
    { icon: <Lock className="w-5 h-5" />, label: "Change Password", id: "change-password" },
  ];

  const handleItemClick = (id: string) => {
    if (id === "logout") {
      onLogout();
    } else {
      setActiveItem(id);
    }
  };

  const PaymentDialog = ({ child }: { child: Child }) => {
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handlePayment = async () => {
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }
      
      if (parseFloat(paymentAmount) > child.balance) {
        toast.error("Payment amount cannot exceed outstanding balance");
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        const paymentData = {
          studentId: child.id,
          amount: parseFloat(paymentAmount),
          paymentType: 'fee_payment',
          paymentMethod: paymentMethod,
          term: currentTerm,
          academicYear: currentAcademicYear,
          transactionReference: `TRX${Date.now()}`,
          receiptNumber: `RCP${Date.now()}`,
          recordedBy: currentUser?.id,
          notes: `Payment by ${parentName} for ${child.name}`
        };
        
        const payment = await createPaymentAPI(paymentData);
        
        if (payment) {
          toast.success(`Payment of ₦${parseFloat(paymentAmount).toLocaleString()} submitted successfully! Receipt: ${paymentData.receiptNumber}`);
          
          // Refresh payments data
          await loadPaymentsFromAPI();
          
          // Reset form
          setPaymentAmount('');
          setPaymentMethod('bank_transfer');
          setIsSubmitting(false);
          
          // Close dialog
          const dialogElement = document.querySelector('[data-payment-dialog]');
          if (dialogElement) {
            (dialogElement as HTMLDialogElement).close();
          }
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast.error("Payment submission failed. Please try again.");
        setIsSubmitting(false);
      }
    };
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-lg shadow-clinical hover:shadow-clinical-lg transition-all" data-payment-dialog-trigger>
            Pay Now
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-lg bg-white border border-[#E5E7EB] text-[#1F2937]" data-payment-dialog>
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Pay Fees - {child.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="text-[#6B7280]">Outstanding Balance</p>
              <p className="text-[#1F2937] font-semibold">₦{child.balance.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1F2937]">Amount to Pay (₦)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="h-12 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937]"
                max={child.balance}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1F2937]">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-12 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937]">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online_payment">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1F2937]">Upload Payment Proof (Optional)</Label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center cursor-pointer hover:border-[#3B82F6] transition-colors bg-[#F9FAFB]">
                <Upload className="w-6 h-6 mx-auto mb-2 text-[#6B7280]" />
                <p className="text-[#6B7280] text-sm">Click to upload receipt/proof</p>
                <p className="text-xs text-[#6B7280] mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-[#10B981] text-white hover:bg-[#059669] rounded-lg shadow-clinical"
              onClick={handlePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      <div className="lg:pl-64">
        <DashboardTopBar
          userName={parentName}
          userRole="Parent"
          notificationCount={unreadCount}
          onLogout={onLogout}
        />

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {activeItem === "dashboard" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-[#1F2937] mb-2">Parent Dashboard</h1>
                <p className="text-[#6B7280]">Monitor your children's academic progress and manage fees</p>
              </div>

              {/* Parent Permissions Overview */}
              <Card className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#1F2937] font-medium mb-2">Your Access & Responsibilities</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.canViewResults ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-[#6B7280]">View Results</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.canViewAttendance ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-[#6B7280]">View Attendance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.canMakePayments ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-[#6B7280]">Make Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.canViewReports ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-[#6B7280]">View Reports</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.canViewTimetable ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-[#6B7280]">View Timetable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parentPermissions.hasFinancialObligations ? 'bg-orange-500' : 'bg-green-500'}`} />
                          <span className="text-[#6B7280]">
                            {parentPermissions.hasFinancialObligations ? 'Fees Due' : 'Fees Paid'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-[#6B7280]">Children: <strong className="text-[#1F2937]">{parentPermissions.childrenCount}</strong></span>
                        {parentPermissions.hasFinancialObligations && (
                          <span className="text-orange-600">Outstanding: <strong>₦{parentPermissions.totalOutstandingBalance.toLocaleString()}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <Card key={child.id} className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical hover:shadow-clinical-lg transition-all hover-lift">
                    <CardHeader className="p-5 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-[#1F2937]">{child.name}</h3>
                          <p className="text-[#6B7280]">{child.class}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                          <p className="text-xs text-[#6B7280] mb-1">Total Fee</p>
                          <p className="text-[#1F2937] font-medium">₦{child.totalFee.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                          <p className="text-xs text-[#6B7280] mb-1">Balance</p>
                          <p className={child.balance > 0 ? "text-[#EF4444] font-medium" : "text-[#10B981] font-medium"}>
                            ₦{child.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setActiveItem("view-results")}
                          variant="outline"
                          className="flex-1 rounded-lg border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937]"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Result
                        </Button>
                        {child.balance > 0 && <PaymentDialog child={child} />}
                      </div>

                      {child.balance === 0 && (
                        <div className="p-3 bg-[#DCFCE7] border border-[#10B981] rounded-lg text-center">
                          <Badge className="bg-[#10B981] text-white border-0">
                            Fully Paid
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Fee Payment Notifications - Prominent Display */}
              {feeNotifications.length > 0 && (
                <Card className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#10B981] shadow-clinical-lg">
                  <CardHeader className="p-5 border-b border-[#10B981]/20">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#10B981]" />
                      <h3 className="text-[#10B981]">Fee Payment Confirmations</h3>
                      <Badge className="ml-auto bg-[#10B981] text-white border-0">{feeNotifications.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-5">
                    {feeNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-[#10B981]/30 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[#1F2937] font-medium">{notification.title}</p>
                          <p className="text-sm text-[#6B7280] mt-1">{notification.message}</p>
                          <p className="text-xs text-[#6B7280] mt-2">
                            {new Date(notification.sentDate).toLocaleDateString()} at {new Date(notification.sentDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => setActiveItem('notifications')}
                      variant="outline"
                      className="w-full rounded-lg border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10"
                    >
                      View All Notifications
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                  <CardHeader className="p-5 border-b border-[#E5E7EB]">
                    <h3 className="text-[#1F2937]">Recent Notifications</h3>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-5">
                    {notifications
                      .filter(n => (n.targetAudience === 'parents' || n.targetAudience === 'all') && !n.title.includes('Fee Payment'))
                      .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
                      .slice(0, 3)
                      .map((notification) => {
                        const getNotificationType = (type: string) => {
                          if (type === 'success') return 'bg-[#10B981]';
                          if (type === 'warning') return 'bg-[#F59E0B]';
                          if (type === 'error') return 'bg-[#EF4444]';
                          return 'bg-[#3B82F6]';
                        };
                        
                        return (
                          <div key={notification.id} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#3B82F6] hover:shadow-clinical transition-all">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationType(notification.type)}`} />
                            <div className="flex-1">
                              <p className="text-[#1F2937] font-medium">{notification.title}</p>
                              <p className="text-xs text-[#6B7280] mt-1">{notification.message.slice(0, 60)}...</p>
                              <p className="text-xs text-[#6B7280] mt-1">{new Date(notification.sentDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    {(notifications || []).filter(n => n.targetAudience === 'parents' || n.targetAudience === 'all').length === 0 && (
                      <div className="text-center py-8 text-[#6B7280]">
                        No notifications yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                  <CardHeader className="p-5 border-b border-[#E5E7EB]">
                    <h3 className="text-[#1F2937]">Quick Actions</h3>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-5">
                    <Button
                      onClick={() => setActiveItem("view-results")}
                      className="w-full justify-start bg-[#F9FAFB] text-[#1F2937] hover:bg-[#3B82F6] hover:text-white rounded-lg h-12 border border-[#E5E7EB] transition-all"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      View Academic Reports
                    </Button>
                    <Button
                      onClick={() => setActiveItem("pay-fees")}
                      className="w-full justify-start bg-[#F9FAFB] text-[#1F2937] hover:bg-[#3B82F6] hover:text-white rounded-lg h-12 border border-[#E5E7EB] transition-all"
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      Make Payment
                    </Button>
                    <Button
                      onClick={() => setActiveItem("notifications")}
                      className="w-full justify-start bg-[#F9FAFB] text-[#1F2937] hover:bg-[#3B82F6] hover:text-white rounded-lg h-12 border border-[#E5E7EB] transition-all"
                    >
                      <Receipt className="w-5 h-5 mr-3" />
                      View Payment History
                    </Button>
                    <Button
                      onClick={() => setActiveItem("view-results")}
                      className="w-full justify-start bg-[#F9FAFB] text-[#1F2937] hover:bg-[#3B82F6] hover:text-white rounded-lg h-12 border border-[#E5E7EB] transition-all"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      Download Report Card
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeItem === "my-children" && (
            <MyChildrenPage 
              onNavigateToResults={() => setActiveItem("view-results")}
              onNavigateToFees={() => setActiveItem("pay-fees")}
            />
          )}

          {activeItem === "view-results" && <ViewResultsPage />}
          {activeItem === "performance-reports" && <PerformanceReportsPage />}
          {activeItem === "pay-fees" && <PayFeePage />}
          {activeItem === "change-password" && <ChangePasswordPage />}
          {activeItem === "notifications" && <NotificationsPage />}
          {activeItem === "view-attendance" && <ViewAttendancePage />}
          {activeItem === "exam-timetable" && <ViewExamTimetablePage userRole="parent" />}
          
          {!["dashboard", "my-children", "view-results", "performance-reports", "pay-fees", "change-password", "notifications", "view-attendance", "exam-timetable"].includes(activeItem) && (
            <div className="space-y-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical max-w-md w-full">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mx-auto mb-4 text-white">
                      {sidebarItems.find(item => item.id === activeItem)?.icon}
                    </div>
                    <h3 className="text-[#1F2937] mb-3">
                      {sidebarItems.find(item => item.id === activeItem)?.label}
                    </h3>
                    <p className="text-[#6B7280]">
                      This section contains the functionality for {sidebarItems.find(item => item.id === activeItem)?.label.toLowerCase()}.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
