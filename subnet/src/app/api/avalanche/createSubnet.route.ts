import { NextApiRequest, NextApiResponse } from 'next';
import { U2U } from 'U2U';
import { createSubnetTx } from '../../../lib/U2U/txHelpers';
import { getU2UClient } from '../../../lib/U2U/client';

export default async function createSubnet(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { subnetId, tokenSymbol, vmType, gasFeeConfig } = req.body;

    if (!subnetId || !tokenSymbol || !vmType || !gasFeeConfig) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const U2U = getU2UClient();
        const tx = createSubnetTx(U2U, subnetId, tokenSymbol, vmType, gasFeeConfig);
        const txID = await U2U.buildAndSend(tx);

        return res.status(200).json({ txID });
    } catch (error) {
        console.error('Error creating subnet:', error);
        return res.status(500).json({ error: 'Failed to create subnet' });
    }
}