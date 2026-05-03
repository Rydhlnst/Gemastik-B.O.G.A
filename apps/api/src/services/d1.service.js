// apps/api/src/services/d1.service.js
require('dotenv').config();

/**
 * Service untuk interaksi dengan Cloudflare D1
 */
async function queryD1(sqlQuery, params = []) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const dbId = process.env.CLOUDFLARE_DATABASE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: sqlQuery,
                params: params
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.errors[0]?.message || "Gagal query ke D1");
        }

        return data.result[0]; 
    } catch (error) {
        console.error("❌ D1 Service Error:", error.message);
        throw error;
    }
}

/**
 * Menjalankan banyak query sekaligus (Batch)
 * Berguna untuk migrasi/rebuild tabel dengan Foreign Key
 */
async function batchD1(queries) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const dbId = process.env.CLOUDFLARE_DATABASE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

    try {
        const batchData = queries.map(q => ({
            sql: q.sql,
            params: q.params || []
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(batchData) // Mengirim Array langsung
        });

        const data = await response.json();
        if (!data.success) {
            console.error("D1 Batch Detail Error:", data.errors);
            throw new Error(data.errors[0]?.message || "Gagal batch query");
        }

        return data.result;
    } catch (error) {
        console.error("❌ D1 Batch Error:", error.message);
        throw error;
    }
}

module.exports = { queryD1, batchD1 };