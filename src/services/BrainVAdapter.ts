import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { IDataSource, ConnectionStatus } from './IDataSource';
import { BluetoothDevice, BluetoothErrorType, BLE_UUIDS } from '../types/bluetooth';
import EEGDataBuffer from './EEGDataBuffer';

class BrainVAdapter implements IDataSource {
    readonly adapterId = 'BrainV';
    private manager: BleManager;
    private scanning = false;
    private connectionStatus: ConnectionStatus = {
        connected: false,
        connecting: false,
        reconnecting: false,
    };
    private connectedDevice: Device | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private stateSubscription: Subscription | null = null;

    constructor() {
        // Singleton BleManager instance is recommended. 
        // If BluetoothServicePlx is removed, we create new instance here.
        // For now assuming we are taking ownership.
        this.manager = new BleManager();
    }

    async initialize(): Promise<void> {
        console.log('[BrainVAdapter] Initializing...');

        // Check permissions first
        if (Platform.OS === 'android') {
            const granted = await this.requestAndroidPermissions();
            if (!granted) {
                throw new Error('Bluetooth permissions denied');
            }
        }

        // Monitor state
        this.stateSubscription = this.manager.onStateChange((state) => {
            console.log('[BrainVAdapter] BLE State:', state);
        }, true);

        // Wait for PoweredOn state? 
        // BlePlx usually handles this in startDeviceScan, but good to be safe.
    }

    async startScan(onDeviceFound: (device: BluetoothDevice) => void): Promise<void> {
        if (this.scanning) return;

        const state = await this.manager.state();
        if (state !== State.PoweredOn) {
            throw new Error(`Bluetooth is ${state}`);
        }

        console.log('[BrainVAdapter] Starting scan...');
        this.scanning = true;

        this.manager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
            if (error) {
                console.error('[BrainVAdapter] Scan error:', error);
                this.scanning = false;
                return;
            }

            if (device && device.name) {
                // Here we could filter for specific BrainV names if needed
                // e.g. if (device.name.startsWith('NV-')) ...

                onDeviceFound({
                    id: device.id,
                    name: device.name || device.localName || 'Unknown',
                    rssi: device.rssi || 0,
                    advertising: {
                        serviceUUIDs: device.serviceUUIDs,
                        localName: device.localName,
                    }
                });
            }
        });
    }

    async stopScan(): Promise<void> {
        if (!this.scanning) return;
        this.manager.stopDeviceScan();
        this.scanning = false;
        console.log('[BrainVAdapter] Scan stopped');
    }

    async connect(deviceId: string): Promise<void> {
        this.updateStatus({ connecting: true, error: undefined });

        try {
            console.log(`[BrainVAdapter] Connecting to ${deviceId}...`);
            const device = await this.manager.connectToDevice(deviceId);

            this.connectedDevice = device;

            console.log('[BrainVAdapter] Discovering services...');
            await device.discoverAllServicesAndCharacteristics();

            this.updateStatus({
                connected: true,
                connecting: false,
                deviceId: device.id
            });

            // Handle spontaneous disconnects for "Silent Reconnect"
            device.onDisconnected((error, disconnectedDevice) => {
                console.warn('[BrainVAdapter] Device disconnected', error);
                this.handleDisconnect(disconnectedDevice.id);
            });

        } catch (error: any) {
            console.error('[BrainVAdapter] Connection failed', error);
            this.updateStatus({
                connecting: false,
                error: error.message || 'Connection failed'
            });
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.connectedDevice) {
            console.log('[BrainVAdapter] Disconnecting...');
            // Clear reconnect timer if user manually disconnects
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            await this.manager.cancelDeviceConnection(this.connectedDevice.id);
            this.connectedDevice = null;
        }
        this.updateStatus({ connected: false, connecting: false, reconnecting: false, deviceId: undefined });
    }

    getConnectionStatus(): ConnectionStatus {
        return { ...this.connectionStatus };
    }

    async subscribeToData(onDataReceived: (data: string) => void): Promise<Subscription> {
        if (!this.connectedDevice) {
            throw new Error('No device connected');
        }

        // Subscribe to RX Characteristic (Notify) - defined in BLE_UUIDS.TX_CHARACTERISTIC based on previous file
        // NOTE: The previous file bluetooth.ts says TX_CHARACTERISTIC (6E400003) is for "Notify" (Receive)
        // and RX (6E400002) is for "Write" (Send). 
        // Nordic UART naming convention: RX on central = TX on peripheral.

        const serviceUUID = BLE_UUIDS.SERVICE;
        const charUUID = BLE_UUIDS.TX_CHARACTERISTIC;

        console.log(`[BrainVAdapter] Subscribing to ${charUUID}...`);

        return this.manager.monitorCharacteristicForDevice(
            this.connectedDevice.id,
            serviceUUID,
            charUUID,
            (error, characteristic) => {
                if (error) {
                    console.error('[BrainVAdapter] Monitor error:', error);
                    return;
                }
                if (characteristic?.value) {
                    try {
                        EEGDataBuffer.appendData(characteristic.value);
                    } catch (e) {
                        console.error('[BrainVAdapter] Buffer error', e);
                    }
                    onDataReceived(characteristic.value);
                }
            }
        );
    }

    async cleanup(): Promise<void> {
        this.stopScan();
        this.disconnect();
        this.stateSubscription?.remove();
        this.manager.destroy();
    }

    // --- Internals ---

    private updateStatus(status: Partial<ConnectionStatus>) {
        this.connectionStatus = { ...this.connectionStatus, ...status };
    }

    /**
     * Silent Reconnect Logic
     */
    private handleDisconnect(deviceId: string) {
        this.updateStatus({ connected: false, reconnecting: true });

        console.log('[BrainVAdapter] Attempting silent reconnect in 2s...');
        // Simple retry logic (could be more robust with exponential backoff)
        this.reconnectTimer = setTimeout(async () => {
            try {
                console.log('[BrainVAdapter] Reconnecting now...');
                await this.connect(deviceId);
            } catch (err) {
                console.error('[BrainVAdapter] Reconnect failed, giving up.', err);
                this.updateStatus({ reconnecting: false, error: 'Lost connection' });
            }
        }, 2000);
    }

    private async requestAndroidPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;

        // Simple logic for Android 12+ vs older (copied from service)
        const apiLevel = Platform.Version as number;
        if (apiLevel >= 31) {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            return Object.values(granted).every(s => s === PermissionsAndroid.RESULTS.GRANTED);
        } else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
    }
}

export default new BrainVAdapter();
