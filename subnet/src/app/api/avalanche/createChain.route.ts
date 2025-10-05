import { NextApiRequest, NextApiResponse } from 'next';
import { createChain } from '../../../lib/U2U/txhelpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { subnetId, chainName, vmId, genesisData } = req.body;

    if (!subnetId || !chainName || !vmId || !genesisData) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const txId = await createChain(subnetId, chainName, vmId, genesisData);
        return res.status(200).json({ txId });
    } catch (error) {
        console.error('Error creating chain:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}