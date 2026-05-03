import { vi } from 'vitest';

class MockAuthService {
    constructor() {
        this.login = vi.fn();
        this.daftarVendor = vi.fn();
        this.ambilProfilLengkap = vi.fn();
    }
}

export default MockAuthService;
