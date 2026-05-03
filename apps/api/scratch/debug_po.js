
// Menggunakan global fetch (Node v18+)

async function debugCreatePO() {
    const body = {
        vendorId: 'ACC-VEN-32730001',
        pembeliId: 'ACC-GOV-31710001',
        items: [{ commodityId: 'COM-06A9', quantity: 1, price: 15000 }]
    };

    console.log('🚀 Mengirim request debug ke /api/spk/create...');
    try {
        const res = await fetch('http://127.0.0.1:3001/api/spk/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        console.log('📊 Response dari Server:', JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('❌ Request Gagal:', err.message);
    }
}

debugCreatePO();
