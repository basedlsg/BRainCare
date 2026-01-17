"""
brainBCI_visualizer.py v3.0 - 脑电信号蓝牙实时监测系统 (NV-BrainRF 适配版)
功能说明：
1. 自动扫描并连接指定蓝牙设备
2. 发送三次启动命令确保设备激活
3. 实时解析8通道24bit脑电数据
4. 自适应波形幅度显示
5. 智能数据包校验和错误处理
6. 多线程安全操作

修改说明：
- 已适配 NV-BrainRF 设备的 Nordic UART Service
- 使用实际设备的 UUID 配置
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

# ========== 配置参数 (已适配 NV-BrainRF) ==========
APP_VERSION = "v3.1 (NV-BrainRF 调试版)"
BUILD_DATE = "2025-11-11"

# 设备配置 - 请根据扫描结果填写你的设备 MAC 地址
# TARGET_MAC = "98:0C:33:F1:93:8D"  # 替换为你的 NV-BrainRF MAC 地址
TARGET_MAC = "45FAF574-F25E-FD62-0A78-B8810E518C7C"
# Nordic UART Service UUIDs (NV-BrainRF 实际使用的)
SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
WRITE_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"  # TX - 写入命令
NOTIFY_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"  # RX - 接收数据
# NOTIFY2_CHAR_UUID = "6e400004-b5a3-f393-e0a9-e50e24dcca9e"  # RX2 - 第二接收通道 (可选)

# 启动命令配置
# 如果设备不发送数据，尝试以下命令:
# START_CMD = b'b'        # 启动数据流
# START_CMD = b's'        # 开始采集
# START_CMD = b'\x01'     # 二进制启动
# START_CMD = b''         # 不发送命令（设备自动发送）
START_CMD = b'bb'

BUFFER_SIZE = 800  # 增大缓冲区应对高采样率
# =============================

class BCIBluetoothClient(QtCore.QObject):
    data_parsed = QtCore.Signal(object)
    status_update = QtCore.Signal(str)

    def __init__(self):
        super().__init__()
        self.client = None
        self.running = False
        self.data_streaming = False  # 数据流状态
        self.raw_buffer = bytearray()
        self.packet_size = 33
        self.packet_counter = 0
        self.write_char = None
        self.notify_char = None

        # 调试统计
        self.debug_enabled = True  # 启用调试模式
        self.total_bytes_received = 0
        self.total_packets_parsed = 0
        self.total_packets_failed = 0
        self.receive_count = 0

    async def connect_device(self, mac_address):
        """设备连接全生命周期管理"""
        self._log_system("正在初始化蓝牙连接...")
        try:
            self.client = BleakClient(mac_address)
            await self._retry_connect(attempts=3)
            # _quick_initialize() 已经在 _retry_connect() 中调用
            # 连接成功后，启动后台监听任务
            asyncio.create_task(self._start_monitoring())

        except Exception as e:
            self._log_error(f"连接异常: {str(e)}")
            await self._safe_disconnect()

    async def _retry_connect(self, attempts=3):
        """带重试机制的连接"""
        for i in range(attempts):
            try:
                self._log_operation(f"连接尝试 {i+1}/{attempts}...")
                await self.client.connect(timeout=20.0)
                if self.client.is_connected:
                    self._log_success("蓝牙握手成功 - 立即初始化...")

                    # 快速验证服务存在 - 最小化延迟
                    services_list = list(self.client.services) if self.client.services else []

                    if len(services_list) == 0:
                        await asyncio.sleep(0.3)  # 减少到 0.3 秒
                        services_list = list(self.client.services) if self.client.services else []

                    # 快速检查目标服务是否存在
                    service_found = any(s.uuid.lower() == SERVICE_UUID.lower() for s in services_list)

                    if not service_found:
                        if i < attempts - 1:
                            self._log_warning("服务未找到，重试...")
                            await self.client.disconnect()
                            await asyncio.sleep(2.0)
                            continue
                        else:
                            raise ValueError("无法找到目标服务")

                    # 立即初始化设备 - 不再验证特征，让 _quick_initialize 去做
                    await self._quick_initialize()
                    return
            except Exception as e:
                import traceback
                self._log_warning(f"连接尝试 {i+1}/{attempts} 失败: {str(e)}")
                print(f"错误堆栈:\n{traceback.format_exc()}")
                if self.client and self.client.is_connected:
                    try:
                        await self.client.disconnect()
                    except:
                        pass
                await asyncio.sleep(2.0)
        raise ConnectionError("超过最大重试次数")

    async def _quick_initialize(self):
        """快速初始化 - 在连接验证后立即执行"""
        print("\n" + "="*80)
        print("[初始化] 开始设备初始化流程...")
        print("="*80)

        # 快速查找特征
        write_char = None
        notify_char = None

        print("[查找特征] 开始搜索服务和特征...")
        for service in self.client.services:
            print(f"[服务] UUID: {service.uuid}")
            if service.uuid.lower() == SERVICE_UUID.lower():
                print(f"[✓ 目标服务] 找到 Nordic UART Service")
                for char in service.characteristics:
                    print(f"  [特征] UUID: {char.uuid} | 属性: {char.properties}")
                    if char.uuid.lower() == WRITE_CHAR_UUID.lower():
                        write_char = char
                        print(f"  [✓ 写入特征] 已找到")
                    if char.uuid.lower() == NOTIFY_CHAR_UUID.lower():
                        notify_char = char
                        print(f"  [✓ 通知特征] 已找到")
                if write_char and notify_char:
                    break

        # 验证找到了特征
        if not write_char or not notify_char:
            error_msg = f"特征未找到 - write: {write_char is not None}, notify: {notify_char is not None}"
            print(f"[✗ 错误] {error_msg}")
            raise ValueError(error_msg)

        print(f"\n[订阅通知] 准备订阅数据接收通知...")
        print(f"[订阅通知] 特征 UUID: {notify_char.uuid}")
        print(f"[订阅通知] 回调函数: _data_pipeline")

        try:
            await self.client.start_notify(notify_char, self._data_pipeline)
            print(f"[✓ 订阅成功] 通知订阅已激活，等待数据...")
        except Exception as e:
            print(f"[✗ 订阅失败] 错误: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise

        # 不再自动发送启动命令，改由用户手动控制
        self.write_char = write_char
        self.notify_char = notify_char
        self.running = True

        print(f"\n[✓ 初始化完成] 设备就绪，连接已建立")
        print(f"[提示] 使用'启动数据流 (b)'按钮手动发送启动命令来开始接收数据")
        print("="*80 + "\n")

        self._log_success("✓ 设备已连接，等待手动启动数据流")

    async def _initialize_device(self):
        """设备初始化协议 - 快速操作避免超时"""
        # 查找正确的特征对象
        write_char = None
        notify_char = None

        self._log_operation("查找设备特征...")
        for service in self.client.services:
            if service.uuid.lower() == SERVICE_UUID.lower():
                for char in service.characteristics:
                    if char.uuid.lower() == WRITE_CHAR_UUID.lower():
                        write_char = char
                    if char.uuid.lower() == NOTIFY_CHAR_UUID.lower():
                        notify_char = char

        if not write_char or not notify_char:
            raise ValueError(f"未找到必需的特征")

        print(f"✓ Write: {write_char.uuid}")
        print(f"✓ Notify: {notify_char.uuid}")

        # 立即订阅通知 - 不等待！
        self._log_operation(f"订阅通知...")
        try:
            await self.client.start_notify(notify_char, self._data_pipeline)
            self._log_success("✓ 订阅成功")
        except Exception as e:
            self._log_error(f"订阅失败: {str(e)}")
            # 检查是否因为连接断开
            if not self.client.is_connected:
                raise ConnectionError("设备在订阅时断开连接，可能需要保持活跃")
            raise

        # 立即发送命令 - 最小延迟
        self._log_operation(f"发送启动命令...")
        for i in range(3):
            try:
                await self.client.write_gatt_char(write_char, START_CMD, response=False)
                print(f"✓ 命令 #{i+1} 已发送")
                await asyncio.sleep(0.05)  # 最小延迟
            except Exception as e:
                self._log_error(f"命令失败 #{i+1}: {str(e)}")
                if not self.client.is_connected:
                    raise ConnectionError(f"设备在发送命令时断开连接")

        # 保存特征引用
        self.write_char = write_char
        self.notify_char = notify_char
        self.running = True
        self._log_success(f"✓ 初始化完成")

    async def _start_monitoring(self):
        """进入数据监听模式"""
        self._log_system("进入数据采集状态", "▶")
        print("\n[监听模式] 开始监听数据...")
        print("[监听模式] 将每5秒打印一次状态信息")
        print("="*80)

        last_packet_count = 0
        monitoring_seconds = 0

        while self.running:
            await asyncio.sleep(1.0)
            monitoring_seconds += 1

            # 每5秒打印一次状态
            if monitoring_seconds % 5 == 0:
                new_packets = self.packet_counter - last_packet_count
                last_packet_count = self.packet_counter

                print(f"\n{'='*80}")
                print(f"[状态报告] 监听时长: {monitoring_seconds} 秒")
                print(f"[接收统计] 收到数据次数: {self.receive_count}")
                print(f"[接收统计] 累计接收字节: {self.total_bytes_received}")
                print(f"[数据包统计] 成功解析: {self.total_packets_parsed} | 失败: {self.total_packets_failed}")
                print(f"[最近5秒] 新增数据包: {new_packets} 个")
                print(f"[连接状态] {'✓ 已连接' if self.client and self.client.is_connected else '✗ 已断开'}")
                print(f"[缓冲区] 当前大小: {len(self.raw_buffer)} 字节")

                if self.receive_count == 0:
                    print(f"\n[⚠ 警告] 未收到任何数据！可能的原因:")
                    print(f"  1. 设备未启动数据发送")
                    print(f"  2. 启动命令 '{START_CMD.decode() if len(START_CMD) == 1 else START_CMD.hex()}' 不正确")
                    print(f"  3. 设备需要手动启动或按钮触发")
                    print(f"  4. 通知订阅未成功")
                    print(f"\n[建议] 尝试以下操作:")
                    print(f"  - 检查设备是否有LED指示灯显示数据传输状态")
                    print(f"  - 尝试修改 START_CMD (当前: {START_CMD})")
                    print(f"  - 查看设备文档了解启动流程")

                print(f"{'='*80}\n")

    async def send_custom_command(self, cmd):
        """发送自定义命令（用于调试）"""
        if not self.write_char:
            print("[错误] 设备未初始化，无法发送命令")
            return False

        try:
            if isinstance(cmd, str):
                cmd = cmd.encode()

            print(f"\n[发送自定义命令] 命令内容: {cmd} (十六进制: {cmd.hex()})")
            await self.client.write_gatt_char(self.write_char, cmd, response=False)
            print(f"[✓ 发送成功]")
            return True
        except Exception as e:
            print(f"[✗ 发送失败] 错误: {str(e)}")
            return False

    async def _safe_disconnect(self):
        """安全断开连接"""
        if self.client and self.client.is_connected:
            # 不再自动发送停止命令，改由用户手动控制
            # 停止通知
            if hasattr(self, 'notify_char') and self.notify_char:
                try:
                    await self.client.stop_notify(self.notify_char)
                except Exception as e:
                    self._log_warning(f"停止通知失败: {str(e)}")

            await self.client.disconnect()
            self.data_streaming = False  # 重置数据流状态
            self._log_system("连接安全终止", "⏹")

    async def start_data_stream(self):
        """启动数据流 - 发送 'b' 命令"""
        if not self.client or not self.client.is_connected:
            print("[错误] 设备未连接，无法启动数据流")
            self._log_error("设备未连接")
            return False

        if not self.write_char:
            print("[错误] 设备未初始化，无法发送命令")
            self._log_error("设备未初始化")
            return False

        try:
            print(f"\n[启动数据流] 发送启动命令 'b'...")
            await self.client.write_gatt_char(self.write_char, b'b', response=False)
            print(f"[✓ 发送成功]")

            self.data_streaming = True
            self._log_success("✓ 数据流已启动")
            print(f"[状态] 数据流已启动，等待数据接收...\n")
            return True
        except Exception as e:
            print(f"[✗ 启动失败] 错误: {str(e)}")
            self._log_error(f"启动数据流失败: {str(e)}")
            return False

    async def stop_data_stream(self):
        """停止数据流 - 发送 'sv' 命令"""
        if not self.client or not self.client.is_connected:
            print("[错误] 设备未连接，无法停止数据流")
            self._log_error("设备未连接")
            return False

        if not self.write_char:
            print("[错误] 设备未初始化，无法发送命令")
            self._log_error("设备未初始化")
            return False

        try:
            print(f"\n[停止数据流] 发送停止命令 'sv'...")
            await self.client.write_gatt_char(self.write_char, b'sv', response=False)
            await asyncio.sleep(0.2)  # 等待命令处理

            self.data_streaming = False
            self._log_success("✓ 数据流已停止")
            print(f"[状态] 数据流已停止\n")
            return True
        except Exception as e:
            print(f"[✗ 停止失败] 错误: {str(e)}")
            self._log_error(f"停止数据流失败: {str(e)}")
            return False

    def _data_pipeline(self, sender, data):
        """数据处理流水线"""
        try:
            self.receive_count += 1
            data_len = len(data)
            self.total_bytes_received += data_len

            # 首次接收数据的特殊提示
            if self.receive_count == 1:
                print("\n" + "🎉"*40)
                print("🎉 首次接收到数据！数据接收回调已成功触发！")
                print("🎉"*40 + "\n")

            # 详细调试信息
            if self.debug_enabled:
                hex_str = ' '.join([f'{b:02x}' for b in data])
                print(f"\n{'='*80}")
                print(f"[接收 #{self.receive_count}] 收到 {data_len} 字节数据")
                print(f"[十六进制] {hex_str}")
                print(f"[累计接收] {self.total_bytes_received} 字节 | 已解析数据包: {self.total_packets_parsed} | 失败: {self.total_packets_failed}")

                # 检查是否包含起始/结束标记
                has_start = 0xA0 in data
                has_end = 0xC0 in data
                print(f"[标记检查] 起始标记(0xA0): {'✓ 存在' if has_start else '✗ 不存在'} | 结束标记(0xC0): {'✓ 存在' if has_end else '✗ 不存在'}")

                if has_start:
                    start_pos = data.index(0xA0)
                    print(f"[起始位置] 0xA0 在第 {start_pos} 字节")

                if has_end:
                    end_pos = data.index(0xC0)
                    print(f"[结束位置] 0xC0 在第 {end_pos} 字节")

            self.raw_buffer += data

            if self.debug_enabled:
                print(f"[缓冲区状态] 添加后总长度: {len(self.raw_buffer)} 字节")
                if len(self.raw_buffer) >= self.packet_size:
                    print(f"[缓冲区状态] ✓ 足够一个完整数据包 (需要 {self.packet_size} 字节)")
                else:
                    print(f"[缓冲区状态] ✗ 数据不足 (需要 {self.packet_size} 字节，还差 {self.packet_size - len(self.raw_buffer)} 字节)")
                print(f"{'='*80}\n")

            self._process_packets()
        except Exception as e:
            import traceback
            self._log_error(f"数据处理异常: {str(e)}")
            print(f"错误堆栈:\n{traceback.format_exc()}")

    def _process_packets(self):
        """数据包处理引擎"""
        processed = 0
        iteration = 0

        if self.debug_enabled:
            print(f"\n[数据包处理] 开始处理，缓冲区当前大小: {len(self.raw_buffer)} 字节")

        while len(self.raw_buffer) >= self.packet_size:
            iteration += 1
            if self.debug_enabled:
                print(f"\n[处理循环 #{iteration}] 缓冲区长度: {len(self.raw_buffer)} 字节")

            start = self.raw_buffer.find(0xA0)
            if start == -1:
                # 没有找到起始标记
                if self.debug_enabled:
                    hex_str = ' '.join([f'{b:02x}' for b in self.raw_buffer[:min(50, len(self.raw_buffer))]])
                    print(f"[✗ 失败] 未找到起始标记 0xA0")
                    print(f"[缓冲区内容] 前 {min(50, len(self.raw_buffer))} 字节: {hex_str}")
                    print(f"[操作] 清空缓冲区 {len(self.raw_buffer)} 字节")
                self.raw_buffer.clear()
                return

            if self.debug_enabled:
                print(f"[✓ 找到起始] 0xA0 位于位置 {start}")
                if start > 0:
                    print(f"[丢弃数据] 起始标记前有 {start} 字节无效数据，将被丢弃")

            if len(self.raw_buffer[start:]) < self.packet_size:
                # 数据不够一个完整包
                if self.debug_enabled:
                    available = len(self.raw_buffer[start:])
                    print(f"[等待数据] 从起始标记到末尾只有 {available} 字节，需要 {self.packet_size} 字节")
                    print(f"[等待数据] 还需要 {self.packet_size - available} 字节才能组成完整数据包")
                return

            packet = self.raw_buffer[start:start+self.packet_size]
            del self.raw_buffer[:start+self.packet_size]

            if self.debug_enabled:
                hex_str = ' '.join([f'{b:02x}' for b in packet])
                print(f"\n[完整数据包 #{self.packet_counter + 1}] 提取 {len(packet)} 字节")
                print(f"[数据包内容] {hex_str}")
                print(f"[起始标记] 0x{packet[0]:02x} {'✓ 正确' if packet[0] == 0xA0 else '✗ 错误'}")
                print(f"[结束标记] 0x{packet[-1]:02x} {'✓ 正确' if packet[-1] == 0xC0 else '✗ 错误'}")
                print(f"[数据包长度] {len(packet)} 字节 {'✓ 正确' if len(packet) == self.packet_size else '✗ 错误'}")

                # 显示数据包结构
                print(f"[数据包结构]")
                print(f"  起始标记: 0x{packet[0]:02x}")
                print(f"  状态字节: 0x{packet[1]:02x}")
                print(f"  通道数据: {len(packet[2:-1])} 字节 (应为 {self.packet_size - 3} 字节)")
                print(f"  结束标记: 0x{packet[-1]:02x}")

            if packet[-1] == 0xC0:
                if self.debug_enabled:
                    print(f"[✓ 验证通过] 数据包有效，开始解析...")
                self._parse_packet(packet)
                processed += 1
                self.total_packets_parsed += 1
            else:
                # 结束标记不正确
                if self.debug_enabled:
                    print(f"[✗ 验证失败] 结束标记错误: 期望 0xC0，实际 0x{packet[-1]:02x}")
                self.total_packets_failed += 1

        if self.debug_enabled and processed > 0:
            print(f"\n[处理完成] 本轮处理了 {processed} 个数据包")
            print(f"[统计] 总解析: {self.total_packets_parsed} | 总失败: {self.total_packets_failed}")
            print(f"[缓冲区] 剩余 {len(self.raw_buffer)} 字节")

        if processed > 0 and self.packet_counter <= 10:
            self._log_operation(f"处理完成 {processed} 个数据包 (总计: {self.packet_counter})", "✔")

    def _parse_packet(self, packet):
        """数据包解析核心"""
        try:
            if self.debug_enabled:
                print(f"\n[开始解析] 数据包 #{self.packet_counter + 1}")

            channels = [
                int.from_bytes(packet[i:i+3], 'big', signed=True)
                for i in range(2, 26, 3)
            ]

            if self.debug_enabled:
                print(f"[通道数据] 解析出 {len(channels)} 个通道")
                for idx, value in enumerate(channels):
                    byte_offset = 2 + idx * 3
                    raw_bytes = packet[byte_offset:byte_offset+3]
                    hex_str = ' '.join([f'{b:02x}' for b in raw_bytes])
                    print(f"  通道 {idx+1}: {value:8d} (原始: {hex_str})")

            self.data_parsed.emit(channels)
            self.packet_counter += 1

            if self.debug_enabled:
                print(f"[✓ 解析成功] 数据包 #{self.packet_counter} 已发送到显示系统")

        except Exception as e:
            import traceback
            self._log_error(f"数据解析错误: {str(e)}")
            if self.debug_enabled:
                print(f"错误堆栈:\n{traceback.format_exc()}")

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
        self.start_data_btn = QtWidgets.QPushButton("启动数据流 (b)", self)
        self.stop_data_btn = QtWidgets.QPushButton("停止数据流 (sv)", self)
        self.status_label = QtWidgets.QLabel("状态: 就绪", self)

        # 初始状态：数据流控制按钮禁用，直到连接成功
        self.start_data_btn.setEnabled(False)
        self.stop_data_btn.setEnabled(False)

        panel.addWidget(self.scan_btn)
        panel.addWidget(self.connect_btn)
        panel.addWidget(self.start_data_btn)
        panel.addWidget(self.stop_data_btn)
        panel.addWidget(self.status_label)
        return panel

    def _init_plots(self):
        """初始化波形图"""
        self.plots = []
        self.curves = []
        for i in range(self.num_channels):
            plot = self.graph.addPlot(row=i, col=0)
            plot.setLabel('left', f'Ch{i+1}', 'μV')
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
        self.start_data_btn.clicked.connect(self._start_data_stream)
        self.stop_data_btn.clicked.connect(self._stop_data_stream)
        self.bt_client.data_parsed.connect(self._update_buffer)
        self.bt_client.status_update.connect(self._update_status)

    def _print_banner(self):
        """打印启动信息"""
        print("="*60)
        print(f"NeuroSignal Visualizer {APP_VERSION}")
        print(f"Build Date: {BUILD_DATE}")
        print("-"*60)
        print("设备配置:")
        print(f"  目标设备: NV-BrainRF")
        print(f"  MAC 地址: {TARGET_MAC}")
        print(f"  Service UUID: {SERVICE_UUID}")
        print(f"  Write UUID: {WRITE_CHAR_UUID}")
        print(f"  Notify UUID: {NOTIFY_CHAR_UUID}")
        print("-"*60)
        print("系统配置:")
        print(f"  采样缓冲区: {BUFFER_SIZE} 点/通道")
        print(f"  显示刷新率: {self.plot_refresh_rate} Hz")
        print(f"  动态缩放系数: {self.dynamic_scale_factor}")
        print(f"  🐛 调试模式: {'✓ 已启用' if self.bt_client.debug_enabled else '✗ 已禁用'}")
        print("-"*60)
        print("📊 数据包格式 (33字节):")
        print("  [0]      帧头 0xA0")
        print("  [1]      帧计数")
        print("  [2-25]   8通道数据 (每通道3字节, 24位有符号整数)")
        print("  [26-31]  加速度计/陀螺仪 (6字节)")
        print("  [32]     帧尾 0xC0")
        print("="*60)
        print("\n💡 调试提示:")
        print("  1. 控制调试模式:")
        print("     window.bt_client.debug_enabled = False  # 关闭详细调试")
        print("     window.bt_client.debug_enabled = True   # 开启详细调试")
        print("\n  2. 测试不同启动命令 (在Python控制台):")
        print("     import asyncio")
        print("     asyncio.create_task(window.bt_client.send_custom_command(b's'))")
        print("     asyncio.create_task(window.bt_client.send_custom_command(b'\\x01'))")
        print("\n  3. 如果没有收到数据，检查:")
        print("     - 设备是否有LED指示数据传输")
        print("     - 设备是否需要物理按钮启动")
        print("     - 查看5秒状态报告的诊断信息")
        print("="*60)

    def _scan_devices(self):
        """触发设备扫描"""
        asyncio.create_task(self._async_scan())

    async def _async_scan(self):
        """异步设备扫描"""
        print("正在扫描蓝牙设备...")
        self._update_status("正在扫描蓝牙设备...")
        try:
            devices = await BleakScanner.discover(timeout=10.0)
            if devices:
                print("[SCAN] 发现以下设备:")
                for i, d in enumerate(devices):
                    indicator = "✓ 目标设备" if "NV-BrainRF" in (d.name or "") else ""
                    print(f"  {i+1}. {d.name or '未知设备'} - {d.address} {indicator}")
            else:
                print("[SCAN] 未找到有效设备")
        except Exception as e:
            print(f"[ERROR] 扫描失败: {str(e)}")

    def _toggle_connection(self):
        """连接状态切换"""
        if self.bt_client.running:
            self._disconnect()
        else:
            self._connect()

    def _start_data_stream(self):
        """启动数据流按钮处理"""
        if not self.bt_client.running or not self.bt_client.client or not self.bt_client.client.is_connected:
            self._update_status("请先连接设备")
            print("[错误] 请先连接设备")
            return
        asyncio.create_task(self._async_start_data())

    def _stop_data_stream(self):
        """停止数据流按钮处理"""
        if not self.bt_client.running or not self.bt_client.client or not self.bt_client.client.is_connected:
            self._update_status("请先连接设备")
            print("[错误] 请先连接设备")
            return
        asyncio.create_task(self._async_stop_data())

    async def _async_start_data(self):
        """异步启动数据流"""
        success = await self.bt_client.start_data_stream()
        if success:
            self._update_status("数据流已启动")
            # 更新按钮状态
            self.start_data_btn.setEnabled(False)
            self.stop_data_btn.setEnabled(True)
        else:
            self._update_status("启动数据流失败")

    async def _async_stop_data(self):
        """异步停止数据流"""
        success = await self.bt_client.stop_data_stream()
        if success:
            self._update_status("数据流已停止")
            # 更新按钮状态
            self.start_data_btn.setEnabled(True)
            self.stop_data_btn.setEnabled(False)
        else:
            self._update_status("停止数据流失败")

    def _connect(self):
        """启动连接"""
        asyncio.create_task(self._async_connect())

    async def _async_connect(self):
        """异步连接处理"""
        # 更新UI状态
        self.connect_btn.setText("断开")
        self.scan_btn.setEnabled(False)

        # 执行连接（这会阻塞直到连接完成或失败）
        await self.bt_client.connect_device(TARGET_MAC)

        # 连接完成后，根据连接状态启用数据流按钮
        if self.bt_client.running and self.bt_client.client and self.bt_client.client.is_connected:
            self.start_data_btn.setEnabled(True)
            self.stop_data_btn.setEnabled(False)  # 初始时只能启动

    def _disconnect(self):
        """终止连接"""
        self.bt_client.running = False
        self.connect_btn.setText("连接")
        self.scan_btn.setEnabled(True)
        # 禁用数据流控制按钮
        self.start_data_btn.setEnabled(False)
        self.stop_data_btn.setEnabled(False)

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
            app.processEvents()      # 关键：处理Qt事件

    # 启动事件循环
    try:
        loop.run_until_complete(async_main())
    except KeyboardInterrupt:
        pass
    finally:
        loop.close()

    sys.exit(app.exec())
