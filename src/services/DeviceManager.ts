import { IDataSource, ConnectionStatus } from './IDataSource';
import BrainVAdapter from './BrainVAdapter';
import { BluetoothDevice } from '../types/bluetooth';
import { Subscription } from 'react-native-ble-plx';

class DeviceManager {
    private activeAdapter: IDataSource;

    constructor() {
        // Default to BrainV for now. Future: Load from user settings.
        this.activeAdapter = BrainVAdapter;
    }

    get adapter(): IDataSource {
        return this.activeAdapter;
    }

    /**
     * Initialize specific adapter (or switch adapters)
     */
    async initialize(): Promise<void> {
        await this.activeAdapter.initialize();
    }

    startScan(onDeviceFound: (device: BluetoothDevice) => void): Promise<void> {
        return this.activeAdapter.startScan(onDeviceFound);
    }

    stopScan(): Promise<void> {
        return this.activeAdapter.stopScan();
    }

    connect(deviceId: string): Promise<void> {
        return this.activeAdapter.connect(deviceId);
    }

    disconnect(): Promise<void> {
        return this.activeAdapter.disconnect();
    }

    subscribeToData(callback: (data: string) => void): Promise<Subscription | (() => void)> {
        return this.activeAdapter.subscribeToData(callback);
    }

    getStatus(): ConnectionStatus {
        return this.activeAdapter.getConnectionStatus();
    }
}

export default new DeviceManager();
