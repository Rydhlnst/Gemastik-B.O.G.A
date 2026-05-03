import { vi } from 'vitest';

export const registerVendorOnChain = vi.fn().mockResolvedValue('0xmocktxhash');
export const recordMovementOnChain = vi.fn().mockResolvedValue('0xmocktxhash');

export default {
    registerVendorOnChain,
    recordMovementOnChain
};
