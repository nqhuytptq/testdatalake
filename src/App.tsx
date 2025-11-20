import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardOverview } from './components/DashboardOverview';
import { DeviceManagement } from './components/DeviceManagement';
import { DataQuery } from './components/DataQuery';
import { DataVisualization } from './components/DataVisualization';
import { UserManagement } from './components/UserManagement';
import { ProfileDialog } from './components/ProfileDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { Activity, Database, LayoutDashboard, Search, Users, LogOut, User, Settings } from 'lucide-react';
import { Button } from './components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';
import ptitLogo from 'figma:asset/ca5373f0a6915a788922c8d3388c4d99b2f872b7.png';
import { Toaster } from 'react-hot-toast';


function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <Login onSwitchToRegister={() => setShowLogin(false)} />;
  }

  return <Register onSwitchToLogin={() => setShowLogin(true)} />;
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, logout } = useAuth();

  const roleLabels = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    viewer: 'Người xem',
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={ptitLogo} alt="PTIT Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-slate-900">IoT Data Platform</h1>
                <p className="text-sm text-slate-600">Học viện Công nghệ Bưu chính Viễn thông</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected</span>
              </div>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user && roleLabels[user.role]}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowProfile(true)}
                  title="Thông tin cá nhân"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  title="Cài đặt"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Thiết bị</span>
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Truy vấn</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Phân tích</span>
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Người dùng</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="query" className="space-y-6">
            <DataQuery />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DataVisualization />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Dialogs */}
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      
      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
}
