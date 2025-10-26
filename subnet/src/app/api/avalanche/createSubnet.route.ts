import { NextApiRequest, NextApiResponse } from 'next';
import { HBAR } from 'HBAR';
import { createSubnetTx } from '../../../lib/HBAR/txHelpers';
import { getHBARClient } from '../../../lib/HBAR/client';

export default async function createSubnet(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { subnetId, tokenSymbol, vmType, gasFeeConfig } = req.body;

    if (!subnetId || !tokenSymbol || !vmType || !gasFeeConfig) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const HBAR = getHBARClient();
        const tx = createSubnetTx(HBAR, subnetId, tokenSymbol, vmType, gasFeeConfig);
        const txID = await HBAR.buildAndSend(tx);

        return res.status(200).json({ txID });
    } catch (error) {
        console.error('Error creating subnet:', error);
        return res.status(500).json({ error: 'Failed to create subnet' });
    }
}