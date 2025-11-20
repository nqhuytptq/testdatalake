import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { User, Mail, Shield } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth();

  const roleLabels = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    viewer: 'Người xem',
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin cá nhân</DialogTitle>
          <DialogDescription>
            Thông tin tài khoản của bạn trong hệ thống
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Họ và tên</p>
                <p className="text-slate-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Vai trò</p>
                <Badge className={`mt-1 ${roleColors[user.role]}`} variant="outline">
                  {roleLabels[user.role]}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">ID người dùng</p>
                <p className="text-slate-900 font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
