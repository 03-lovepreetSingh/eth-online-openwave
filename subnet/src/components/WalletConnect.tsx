import React, { useEffect, useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';

const WalletConnect: React.FC = () => {
    const { connect, disconnect, account, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            await connect();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            await disconnect();
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Optionally, you can add logic to check if the wallet is already connected on mount
    }, []);

    return (
        <div>
            {isConnected ? (
                <div>
                    <p>Connected as: {account}</p>
                    <button onClick={handleDisconnect} disabled={loading}>
                        {loading ? 'Disconnecting...' : 'Disconnect Wallet'}
                    </button>
                </div>
            ) : (
                <button onClick={handleConnect} disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            )}
        </div>
    );
};

export default WalletConnect;