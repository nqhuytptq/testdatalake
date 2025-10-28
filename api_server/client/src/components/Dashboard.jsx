import React, { useEffect, useMemo, useState, useRef } from 'react';
import { fetchFiles, fetchMerged, downloadCSV } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]); // danh sách thiết bị
  const [device, setDevice] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(10); // đơn vị giây
  const intervalRef = useRef(null);

  // 📦 Lấy danh sách file (để xem bucket có dữ liệu)
  useEffect(() => {
    fetchFiles().then(res => setFiles(res.data.files || [])).catch(() => {});
  }, []);

  // 🧠 Hàm tải dữ liệu
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (device) params.device = device;
      if (from) params.from = dayjs(from).toISOString();
      if (to) params.to = dayjs(to).toISOString();

      const res = await fetchMerged(params);
      const data = res.data.dataset || [];
      setDataset(data);

      // Cập nhật danh sách device tự động
      const uniqueDevices = [...new Set(data.map(d => d.device))];
      setDevices(uniqueDevices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Tự động refresh mỗi N giây
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(loadData, refreshInterval * 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [refreshInterval, device, from, to]);

  // 🔹 Format dữ liệu cho chart
  const chartData = useMemo(() => {
    return dataset.map(r => ({
      ...r,
      ts: r.timestamp ? dayjs(r.timestamp).format('MM-DD HH:mm:ss') : '',
      temperature: r.temperature ? Number(r.temperature) : undefined,
      humidity: r.humidity ? Number(r.humidity) : undefined,
      co2: r.co2 ? Number(r.co2) : undefined,
    }));
  }, [dataset]);

  // 📤 Xuất CSV
  const handleDownloadCSV = async () => {
    const params = {};
    if (device) params.device = device;
    if (from) params.from = dayjs(from).toISOString();
    if (to) params.to = dayjs(to).toISOString();

    const res = await downloadCSV(params);
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // 🚀 Load ban đầu khi mở web
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 24, fontFamily: 'Segoe UI' }}>
      <h2 style={{ marginBottom: 6, color: '#0078D7' }}>🌐 IoT Data Lake Dashboard</h2>
      <p style={{ color: '#666' }}>
        Files in MinIO: <b>{files.length}</b> | Records loaded: <b>{dataset.length}</b>
      </p>

      {/* ⚙️ Bộ lọc */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto',
          gap: 12,
          alignItems: 'end',
          margin: '20px 0',
        }}
      >
        {/* Dropdown chọn thiết bị */}
        <div>
          <label>Device</label>
          <select
            value={device}
            onChange={e => setDevice(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">All Devices</option>
            {devices.map(dev => (
              <option key={dev} value={dev}>
                {dev}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ lọc thời gian */}
        <div>
          <label>From</label>
          <input
            type="datetime-local"
            value={from}
            onChange={e => setFrom(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div>
          <label>To</label>
          <input
            type="datetime-local"
            value={to}
            onChange={e => setTo(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {/* Auto-refresh */}
        <div>
          <label>Refresh (s)</label>
          <input
            type="number"
            min="0"
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {/* Nút load và export */}
        <button onClick={loadData} disabled={loading} style={{ padding: '10px 14px' }}>
          {loading ? 'Loading...' : 'Reload'}
        </button>
        <button onClick={handleDownloadCSV} disabled={!dataset.length} style={{ padding: '10px 14px' }}>
          Export CSV
        </button>
      </div>

      {/* 📊 Biểu đồ */}
      <div
        style={{
          height: 420,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#ff7300" dot={false} />
            <Line type="monotone" dataKey="humidity" stroke="#387908" dot={false} />
            <Line type="monotone" dataKey="co2" stroke="#0078D7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 Xem trước dataset */}
      <div style={{ marginTop: 20 }}>
        <h4>Sample (first 10 records)</h4>
        <pre
          style={{
            maxHeight: 240,
            overflow: 'auto',
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {JSON.stringify(dataset.slice(0, 10), null, 2)}
        </pre>
      </div>
    </div>
  );
}
