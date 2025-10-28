// simulate_thingsboard.js
const axios = require('axios');

// ==== CẤU HÌNH ====

// Access Token của thiết bị trên ThingsBoard
const ACCESS_TOKEN = 'qqy625pa4e0ycdbdv7nj';

// API ThingsBoard
const TB_URL = `http://localhost:8080/api/v1/${ACCESS_TOKEN}/telemetry`;

// API Node.js (đang lưu sang MinIO)
const NODE_URL = 'http://localhost:5001/upload';

// Danh sách thiết bị mô phỏng
const devices = [
  { id: 'Sensor-Temp01', type: 'temperature' },
  { id: 'Sensor-Humi01', type: 'humidity' },
  { id: 'Sensor-Env01', type: 'environment' },
];

// ==== HÀM SINH DỮ LIỆU NGẪU NHIÊN ====
function random(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateData(device) {
  const base = {
    device: device.id,
    timestamp: new Date().toISOString(),
  };

  switch (device.type) {
    case 'temperature':
      return { ...base, temperature: random(20, 35), humidity: random(40, 70) };
    case 'humidity':
      return { ...base, humidity: random(30, 90), co2: random(300, 600) };
    case 'environment':
      return {
        ...base,
        temperature: random(25, 32),
        humidity: random(45, 75),
        light: random(200, 600),
        co2: random(400, 500),
        battery: random(80, 100),
      };
    default:
      return base;
  }
}

// ==== HÀM GỬI DỮ LIỆU ====
async function sendData(device) {
  const data = generateData(device);

  try {
    // Gửi dữ liệu lên ThingsBoard
    const tbRes = await axios.post(TB_URL, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (tbRes.status === 200) {
      console.log(`📡 Gửi tới ThingsBoard (${device.id}) ✅`);
    }

    // Gửi đồng thời sang Node.js để lưu MinIO
    const nodeRes = await axios.post(NODE_URL, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(
      `💾 Đã lưu MinIO (${device.id}):`,
      nodeRes.data.file,
      '\n-------------------------------------------'
    );
  } catch (err) {
    console.error(`❌ Lỗi khi gửi từ ${device.id}:`, err.message);
  }
}

// ==== MÔ PHỎNG LIÊN TỤC ====
function startSimulation() {
  console.log('🚀 BẮT ĐẦU MÔ PHỎNG GỬI DỮ LIỆU IoT SONG SONG...');
  console.log('-------------------------------------------');
  setInterval(() => {
    devices.forEach((d) => sendData(d));
  }, 5000); 
}

// ==== CHẠY ====
startSimulation();
