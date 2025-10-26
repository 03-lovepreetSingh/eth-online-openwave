import React, { useEffect, useState } from 'react';
import { getSubnetInfo } from '../lib/HBAR/client'; // Assuming this function fetches subnet info

const SubnetDashboard = () => {
    const [subnetInfo, setSubnetInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubnetInfo = async () => {
            try {
                const info = await getSubnetInfo(); // Fetch subnet information
                setSubnetInfo(info);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubnetInfo();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Subnet Dashboard</h1>
            {subnetInfo ? (
                <div>
                    <h2>Subnet ID: {subnetInfo.id}</h2>
                    <p>Token Symbol: {subnetInfo.tokenSymbol}</p>
                    <p>Blockchains: {subnetInfo.blockchains.join(', ')}</p>
                    {/* Add more subnet details as needed */}
                </div>
            ) : (
                <p>No subnet information available.</p>
            )}
        </div>
    );
};

export default SubnetDashboard;