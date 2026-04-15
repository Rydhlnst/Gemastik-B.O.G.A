// apps/api/src/services/d1.service.js

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

        return data.result[0]; // Mengembalikan hasil query
    } catch (error) {
        console.error("❌ D1 Service Error:", error.message);
        throw error;
    }
}

module.exports = { queryD1 };