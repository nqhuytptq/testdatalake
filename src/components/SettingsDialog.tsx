import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Bell, Moon, Globe } from 'lucide-react';
import { useState } from 'react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('vi');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Tùy chỉnh cài đặt hệ thống theo nhu cầu của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Bell className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <Label htmlFor="notifications" className="cursor-pointer">
                    Thông báo
                  </Label>
                  <p className="text-sm text-slate-500">
                    Nhận thông báo từ hệ thống
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator />

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Moon className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <Label htmlFor="darkmode" className="cursor-pointer">
                    Chế độ tối
                  </Label>
                  <p className="text-sm text-slate-500">
                    Sử dụng giao diện tối
                  </p>
                </div>
              </div>
              <Switch
                id="darkmode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            {/* Language */}
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-slate-500 mt-2" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
