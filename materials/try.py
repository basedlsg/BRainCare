"""
brainBCI_visualizer.py v3.0 - 脑电信号蓝牙实时监测系统
功能说明：
1. 自动扫描并连接指定蓝牙设备
2. 发送三次启动命令确保设备激活
3. 实时解析8通道24bit脑电数据
4. 自适应波形幅度显示
5. 智能数据包校验和错误处理
6. 多线程安全操作
"""

import sys
import os
import numpy as np
import pyqtgraph as pg
from pyqtgraph.Qt import QtCore, QtWidgets
from bleak import BleakClient, BleakScanner
import asyncio
import nest_asyncio
from datetime import datetime
import logging

# 初始化异步环境
nest_asyncio.apply()
logging.basicConfig(level=logging.INFO)

# ========== 配置参数 ==========
APP_VERSION = "v3.0 (专业稳定版)"
BUILD_DATE = "2024-03-21"
# TARGET_MAC = "98:0C:33:F1:93:8D"
TARGET_MAC = "45FAF574-F25E-FD62-0A78-B8810E518C7C"
# TARGET_MAC = "FB:FC:4F:D6:B0:12"
SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
WRITE_CHAR_UUID = "6e400004-b5a3-f393-e0a9-e50e24dcca9e"
NOTIFY_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
START_CMD = b'b'
BUFFER_SIZE = 800  # 增大缓冲区应对高采样率


# =============================

class BCIBluetoothClient(QtCore.QObject):
    data_parsed = QtCore.Signal(object)
    status_update = QtCore.Signal(str)

    def __init__(self):
        super().__init__()
        self.client = None
        self.running = False
        self.raw_buffer = bytearray()
        self.packet_size = 33
        self.packet_counter = 0

    async def connect_device(self, mac_address):
        """设备连接全生命周期管理"""
        self._log_system("正在初始化蓝牙连接...")
        try:
            self.client = BleakClient(mac_address)
            await self._retry_connect(attempts=3)
            await self._initialize_device()
            await self._start_monitoring()

        except Exception as e:
            self._log_error(f"连接异常: {str(e)}")
        finally:
            await self._safe_disconnect()

    async def _retry_connect(self, attempts=3):
        """带重试机制的连接"""
        for i in range(attempts):
            try:
                await self.client.connect(timeout=15.0)
                if self.client.is_connected:
                    self._log_success("蓝牙握手成功")
                    # print("\n[设备服务结构]")
                    for service in self.client.services:
                        print(f"Service: {service.uuid}")
                        for char in service.characteristics:
                            props = ', '.join(char.properties)
                            print(f"  Characteristic: {char.uuid} ({props})")

                    return
            except Exception as e:
                self._log_warning(f"连接尝试 {i + 1}/{attempts} 失败: {str(e)}")
                await asyncio.sleep(1.0)
        raise ConnectionError("超过最大重试次数")

    async def _initialize_device(self):
        """设备初始化协议"""
        self._log_operation("发送设备启动命令")
        for i in range(3):
            try:
                await self.client.write_gatt_char(WRITE_CHAR_UUID, START_CMD, response=True)
                self._log_success(f"启动命令确认 #{i + 1}")
            except Exception as e:
                self._log_error(f"启动命令失败 #{i + 1}: {str(e)}")

        await self.client.start_notify(NOTIFY_CHAR_UUID, self._data_pipeline)
        self.running = True

    async def _start_monitoring(self):
        """进入数据监听模式"""
        self._log_system("进入数据采集状态", "▶")
        while self.running:
            await asyncio.sleep(0.01)  # 防止CPU过载

    async def _safe_disconnect(self):
        """安全断开连接"""
        if self.client and self.client.is_connected:
            await self.client.stop_notify(NOTIFY_CHAR_UUID)
            await self.client.disconnect()
            self._log_system("连接安全终止", "⏹")

    def _data_pipeline(self, sender, data):
        """数据处理流水线"""
        try:
            self.raw_buffer += data
            self._process_packets()
        except Exception as e:
            self._log_error(f"数据处理异常: {str(e)}")

    def _process_packets(self):
        """数据包处理引擎"""
        processed = 0
        while len(self.raw_buffer) >= self.packet_size:
            start = self.raw_buffer.find(0xA0)
            if start == -1:
                self.raw_buffer.clear()
                return

            if len(self.raw_buffer[start:]) < self.packet_size:
                return

            packet = self.raw_buffer[start:start + self.packet_size]
            del self.raw_buffer[:start + self.packet_size]

            if packet[-1] == 0xC0:
                self._parse_packet(packet)
                processed += 1

    #    if processed > 0:
    #        self._log_operation(f"处理完成 {processed} 个数据包", "✔")

    def _parse_packet(self, packet):
        """数据包解析核心"""
        try:
            channels = [
                int.from_bytes(packet[i:i + 3], 'big', signed=True)
                for i in range(2, 26, 3)
            ]
            self.data_parsed.emit(channels)
            self.packet_counter += 1
        except Exception as e:
            self._log_error(f"数据解析错误: {str(e)}")

    # 日志系统 --------------------------------------------------
    def _log_system(self, message, symbol="ℹ"):
        """系统级日志"""
        self._emit_log("SYSTEM", symbol, message)

    def _log_operation(self, message, symbol="↔"):
        """操作日志"""
        self._emit_log("OPER", symbol, message)

    def _log_success(self, message):
        """成功日志"""
        self._emit_log("SUCCESS", "✓", message)

    def _log_warning(self, message):
        """警告日志"""
        self._emit_log("WARNING", "⚠", message)

    def _log_error(self, message):
        """错误日志"""
        self._emit_log("ERROR", "✗", message)

    def _emit_log(self, log_type, symbol, message):
        """统一日志发射器"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        log_msg = f"[{timestamp}] {symbol} {log_type}: {message}"
        print(log_msg)
        self.status_update.emit(message)


class RealTimePlot(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.bt_client = BCIBluetoothClient()
        self._init_parameters()
        self._init_ui()
        self._init_data()
        self._setup_connections()
        self._print_banner()

    def _init_parameters(self):
        """初始化运行参数"""
        self.num_channels = 8
        self.plot_refresh_rate = 30  # Hz
        self.dynamic_scale_factor = 0.3

    def _init_ui(self):
        """初始化用户界面"""
        self.setWindowTitle(f'脑电监测系统 {APP_VERSION}')
        self.setWindowIcon(self.style().standardIcon(QtWidgets.QStyle.SP_ComputerIcon))

        main_widget = QtWidgets.QWidget()
        self.setCentralWidget(main_widget)
        layout = QtWidgets.QVBoxLayout(main_widget)

        # 控制面板
        control_panel = self._create_control_panel()
        layout.addLayout(control_panel)

        # 波形显示区
        self.graph = pg.GraphicsLayoutWidget()
        layout.addWidget(self.graph)
        self._init_plots()

        # 刷新定时器
        self.refresh_timer = QtCore.QTimer()
        self.refresh_timer.timeout.connect(self._refresh_plots)
        self.refresh_timer.start(1000 // self.plot_refresh_rate)

    def _create_control_panel(self):
        """创建控制面板"""
        panel = QtWidgets.QHBoxLayout()

        self.scan_btn = QtWidgets.QPushButton("扫描设备", self)
        self.connect_btn = QtWidgets.QPushButton("连接", self)
        self.data_sw_btn = QtWidgets.QPushButton("开关", self)
        self.status_label = QtWidgets.QLabel("状态: 就绪", self)

        panel.addWidget(self.scan_btn)
        panel.addWidget(self.connect_btn)
        panel.addWidget(self.data_sw_btn)
        panel.addWidget(self.status_label)
        return panel

    def _init_plots(self):
        """初始化波形图"""
        self.plots = []
        self.curves = []
        for i in range(self.num_channels):
            plot = self.graph.addPlot(row=i, col=0)
            plot.setLabel('left', f'Ch{i + 1}', 'μV')
            plot.showGrid(x=True, y=True)
            plot.setYRange(-1000, 1000)
            self.plots.append(plot)
            self.curves.append(plot.plot(pen=pg.mkPen(color=pg.intColor(i), antialias=True)))

    def _init_data(self):
        """初始化数据存储"""
        self.data = np.zeros((self.num_channels, BUFFER_SIZE))
        self.ptr = 0

    def _setup_connections(self):
        """建立信号连接"""
        self.scan_btn.clicked.connect(self._scan_devices)
        self.connect_btn.clicked.connect(self._toggle_connection)
        self.data_sw_btn.clicked.connect(self._toggle_data_sw)
        self.bt_client.data_parsed.connect(self._update_buffer)
        self.bt_client.status_update.connect(self._update_status)

    def _print_banner(self):
        """打印启动信息"""
        print("=" * 60)
        print(f"NeuroSignal Visualizer {APP_VERSION}")
        print(f"Build Date: {BUILD_DATE}")
        print("-" * 60)
        print("系统配置:")
        print(f"  采样缓冲区: {BUFFER_SIZE} 点/通道")
        print(f"  显示刷新率: {self.plot_refresh_rate} Hz")
        print(f"  动态缩放系数: {self.dynamic_scale_factor}")
        print("=" * 60)

    def _scan_devices(self):
        """触发设备扫描"""
        asyncio.create_task(self._async_scan())

    async def _async_scan(self):
        """异步设备扫描"""
        print("正在扫描蓝牙设备...")
        self._update_status("正在扫描蓝牙设备...")
        try:
            devices = await BleakScanner.discover(timeout=20.0)
            if devices:
                print("[SCAN] 发现以下设备:")
                for i, d in enumerate(devices):
                    print(f"  {i + 1}. {d.name or '未知设备'} - {d.address}")
            else:
                print("[SCAN] 未找到有效设备")
        except Exception as e:
            self._log_error(f"扫描失败: {str(e)}")

    def _toggle_connection(self):
        """连接状态切换"""
        if self.bt_client.running:
            self._disconnect()
        else:
            self._connect()

    def _toggle_data_sw(self):
        """连接状态切换"""
        if self.bt_client.running:
            self._disconnect()
        else:
            self._connect()

    def _connect(self):
        """启动连接"""
        asyncio.create_task(self.bt_client.connect_device(TARGET_MAC))
        self.connect_btn.setText("断开")
        self.scan_btn.setEnabled(False)

    def _disconnect(self):
        """终止连接"""
        self.bt_client.running = False
        self.connect_btn.setText("连接")
        self.scan_btn.setEnabled(True)

    def _update_buffer(self, eeg_data):
        """更新数据缓冲区"""
        self.data[:, self.ptr] = eeg_data
        self.ptr = (self.ptr + 1) % BUFFER_SIZE

    def _refresh_plots(self):
        """定时刷新波形显示"""
        if self.ptr == 0:
            return

        x = np.arange(-BUFFER_SIZE + self.ptr, self.ptr)
        for i in range(self.num_channels):
            y = np.concatenate([self.data[i, self.ptr:], self.data[i, :self.ptr]])
            self.curves[i].setData(x, y)
            self._adjust_scale(i, y)

    def _adjust_scale(self, ch_index, data):
        """动态调整显示范围"""
        visible_data = data[-200:]
        if len(visible_data) == 0:
            return

        min_val = np.min(visible_data)
        max_val = np.max(visible_data)
        margin = max((max_val - min_val) * self.dynamic_scale_factor, 100)
        self.plots[ch_index].setYRange(min_val - margin, max_val + margin)

    def _update_status(self, message):
        """更新状态显示"""
        self.status_label.setText(f"状态: {message}")

    def closeEvent(self, event):
        """安全关闭程序"""
        self._disconnect()
        self.refresh_timer.stop()
        event.accept()


if __name__ == '__main__':
    # 创建Qt应用
    app = QtWidgets.QApplication(sys.argv)

    # 创建并配置事件循环
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # Windows特殊设置
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    # 创建主窗口
    window = RealTimePlot()
    window.resize(1280, 900)
    window.show()


    # 定义异步主任务
    async def async_main():
        await asyncio.sleep(0.1)  # 保持事件循环活动
        while True:
            await asyncio.sleep(0.1)  # 持续保持事件循环
            app.processEvents()  # 关键：处理Qt事件


    # 启动事件循环
    try:
        loop.run_until_complete(async_main())
    except KeyboardInterrupt:
        pass
    finally:
        loop.close()

    sys.exit(app.exec())