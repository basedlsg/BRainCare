import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    showRawWaveforms: boolean;
    toggleRawWaveforms: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [showRawWaveforms, setShowRawWaveforms] = useState(false);

    const toggleRawWaveforms = () => {
        setShowRawWaveforms(prev => !prev);
    };

    return (
        <SettingsContext.Provider value={{ showRawWaveforms, toggleRawWaveforms }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
