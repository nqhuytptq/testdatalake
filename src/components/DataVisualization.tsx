import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const temperatureData = [
  { time: '00:00', temp: 22.5, target: 24 },
  { time: '04:00', temp: 21.8, target: 24 },
  { time: '08:00', temp: 23.2, target: 24 },
  { time: '12:00', temp: 25.1, target: 24 },
  { time: '16:00', temp: 26.3, target: 24 },
  { time: '20:00', temp: 24.7, target: 24 },
  { time: '23:59', temp: 23.5, target: 24 },
];

const deviceTypeData = [
  { name: 'Temperature', count: 8, color: '#3b82f6' },
  { name: 'Humidity', count: 5, color: '#10b981' },
  { name: 'Motion', count: 4, color: '#f59e0b' },
  { name: 'Pressure', count: 3, color: '#8b5cf6' },
  { name: 'Others', count: 4, color: '#64748b' },
];

const dataVolumeByLocation = [
  { location: 'Warehouse A', volume: 45 },
  { location: 'Office Floor 1', volume: 28 },
  { location: 'Office Floor 2', volume: 32 },
  { location: 'Factory Line 1', volume: 56 },
  { location: 'Factory Line 2', volume: 42 },
  { location: 'Tank Storage', volume: 18 },
];

const alertsData = [
  { date: 'T2', critical: 2, warning: 5, info: 12 },
  { date: 'T3', critical: 1, warning: 8, info: 15 },
  { date: 'T4', critical: 3, warning: 6, info: 10 },
  { date: 'T5', critical: 0, warning: 4, info: 18 },
  { date: 'T6', critical: 1, warning: 7, info: 14 },
  { date: 'T7', critical: 2, warning: 3, info: 9 },
  { date: 'CN', critical: 0, warning: 2, info: 6 },
];

export function DataVisualization() {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Phân tích dữ liệu</CardTitle>
              <CardDescription>Visualize và phân tích dữ liệu từ các thiết bị IoT</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 giờ qua</SelectItem>
                <SelectItem value="24h">24 giờ qua</SelectItem>
                <SelectItem value="7d">7 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Avg Temperature</p>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900">24.2°C</p>
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  <span>-0.8°C</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">vs. tuần trước</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Avg Humidity</p>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900">62.5%</p>
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3.2%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">vs. tuần trước</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Power Consumption</p>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900">245.8 kW</p>
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  <span>-12.4%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">vs. tuần trước</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Temperature Trend</CardTitle>
            <CardDescription>Nhiệt độ trung bình theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual Temp"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố thiết bị</CardTitle>
            <CardDescription>Theo loại sensor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {deviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Volume by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Data Volume theo vị trí</CardTitle>
            <CardDescription>GB data trong 24h qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataVolumeByLocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="location" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts Timeline</CardTitle>
            <CardDescription>Cảnh báo trong tuần qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
                <Bar dataKey="info" stackId="a" fill="#3b82f6" name="Info" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Top Devices theo Data Volume</CardTitle>
          <CardDescription>Thiết bị đẩy nhiều data nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Power Meter #9', volume: '12.4 GB', percentage: 95 },
              { name: 'Motion Detector #5', volume: '8.7 GB', percentage: 67 },
              { name: 'Pressure Sensor #15', volume: '6.2 GB', percentage: 48 },
              { name: 'Temperature Sensor #12', volume: '4.8 GB', percentage: 37 },
              { name: 'Humidity Sensor #8', volume: '3.1 GB', percentage: 24 },
            ].map((device, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-900">{device.name}</span>
                  <Badge variant="outline">{device.volume}</Badge>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
