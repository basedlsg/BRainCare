import { BluetoothDevice } from '../types/bluetooth';
import { Subscription } from 'react-native-ble-plx';

export interface ConnectionStatus {
    connected: boolean;
    connecting: boolean;
    reconnecting: boolean;
    deviceId?: string;
    error?: string;
}

export interface IDataSource {
    /**
     * Unique identifier for the adapter (e.g., "BrainV", "Muse", "AppleHealth")
     */
    readonly adapterId: string;

    /**
     * Initialize the data source (check permissions, hardware state)
     */
    initialize(): Promise<void>;

    /**
     * Start scanning for compatible devices
     */
    startScan(onDeviceFound: (device: BluetoothDevice) => void): Promise<void>;

    /**
     * Stop scanning
     */
    stopScan(): Promise<void>;

    /**
     * Connect to a specific device
     */
    connect(deviceId: string): Promise<void>;

    /**
     * Disconnect from the current device
     */
    disconnect(): Promise<void>;

    /**
     * Get current connection status
     */
    getConnectionStatus(): ConnectionStatus;

    /**
     * Subscribe to real-time data stream
     * @param onDataReceived Callback for raw data packets
     */
    subscribeToData(onDataReceived: (data: string) => void): Promise<Subscription | (() => void)>;

    /**
     * Lifecycle cleanup
     */
    cleanup(): Promise<void>;
}
