import React from 'react';
import WalletConnect from '../components/WalletConnect';
import SubnetDashboard from '../components/SubnetDashboard';

const HomePage = () => {
    return (
        <div>
            <h1>Welcome to the HBAR Subnet Dashboard</h1>
            <WalletConnect />
            <SubnetDashboard />
        </div>
    );
};

export default HomePage;