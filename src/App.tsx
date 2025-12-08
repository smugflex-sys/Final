import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AccountantDashboard } from "./components/AccountantDashboard";
import { ParentDashboard } from "./components/ParentDashboard";
import { ResultReportCard } from "./components/ResultReportCard";
import { Toaster } from "./components/ui/sonner";
import { SchoolProvider } from "./contexts/SchoolContext";
import { NotificationServiceProvider } from "./contexts/NotificationService";

type Page = "landing" | "login" | "dashboard" | "report-card";
type Role = "" | "admin" | "teacher" | "accountant" | "parent";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [userRole, setUserRole] = useState<Role>("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageTransition = (page: Page, role?: Role) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      if (role !== undefined) {
        setUserRole(role);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleNavigateToLogin = () => {
    handlePageTransition("login");
  };

  const handleNavigateToLanding = () => {
    handlePageTransition("landing", "");
  };

  const handleLogin = (role: string) => {
    handlePageTransition("dashboard", role as Role);
  };

  const handleLogout = () => {
    handlePageTransition("landing", "");
  };

  const handleViewReportCard = () => {
    handlePageTransition("report-card");
  };

  const handleCloseReportCard = () => {
    handlePageTransition("dashboard");
  };

  return (
    <SchoolProvider>
      <NotificationServiceProvider>
        <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
          {currentPage === "landing" && (
            <LandingPage onNavigateToLogin={handleNavigateToLogin} />
          )}

          {currentPage === "login" && (
            <LoginPage
              onLogin={handleLogin}
              onNavigateToLanding={handleNavigateToLanding}
            />
          )}

          {currentPage === "dashboard" && userRole === "admin" && (
            <AdminDashboard onLogout={handleLogout} />
          )}

          {currentPage === "dashboard" && userRole === "teacher" && (
            <TeacherDashboard onLogout={handleLogout} />
          )}

          {currentPage === "dashboard" && userRole === "accountant" && (
            <AccountantDashboard onLogout={handleLogout} />
          )}

          {currentPage === "dashboard" && userRole === "parent" && (
            <ParentDashboard onLogout={handleLogout} />
          )}

          {currentPage === "report-card" && (
            <ResultReportCard onClose={handleCloseReportCard} />
          )}

          <Toaster />
        </div>
      </NotificationServiceProvider>
    </SchoolProvider>
  );
}