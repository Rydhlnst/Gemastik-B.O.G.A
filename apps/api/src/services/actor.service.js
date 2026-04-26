const bcrypt = require('bcrypt');
const { ethers } = require('ethers');
const { queryD1 } = require('./d1.service');
const { PROFILE_TABLE_BY_ROLE } = require('../constants/auth.constants');

function getRows(queryResult) {
    return queryResult?.results ?? [];
}

function getFirstRow(queryResult) {
    return getRows(queryResult)[0] ?? null;
}

function mapProfileFields(role, row) {
    if (!row) {
        return null;
    }

    switch (role) {
        case 'VENDOR':
            return {
                namaPerusahaan: row.nama_perusahaan,
                nib: row.nib,
                npwp: row.npwp,
                noHpMitra: row.no_hp_mitra,
                alamatUtama: row.alamat_utama,
                aktaUrl: row.akta_url,
                skUrl: row.sk_url,
                logoUrl: row.logo_url,
                sppgUrl: row.sppg_url,
            };
        case 'SPPG':
            return {
                namaSppg: row.nama_sppg,
                nibSppg: row.nib_sppg,
                izinOperasional: row.izin_operasional,
                picNama: row.pic_nama,
                picNoHp: row.pic_no_hp,
                alamatUtama: row.alamat_utama,
                dokumenSppgUrl: row.dokumen_sppg_url,
            };
        case 'LOGISTIK':
            return {
                namaPerusahaan: row.nama_perusahaan,
                nib: row.nib,
                legalDocUrl: row.legal_doc_url,
                picNama: row.pic_nama,
                picNoHp: row.pic_no_hp,
                alamatUtama: row.alamat_utama,
                armadaRingkas: row.armada_ringkas,
            };
        case 'SCHOOL':
            return {
                namaSekolah: row.nama_sekolah,
                npsn: row.npsn,
                jenjang: row.jenjang,
                kepalaSekolah: row.kepala_sekolah,
                picNoHp: row.pic_no_hp,
                alamatUtama: row.alamat_utama,
            };
        default:
            return null;
    }
}

function pickProfileTable(role) {
    const profileTable = PROFILE_TABLE_BY_ROLE[role];
    if (!profileTable) {
        throw new Error(`Role tidak didukung: ${role}`);
    }
    return profileTable;
}

async function insertProfile(role, actorId, profilePayload) {
    const table = pickProfileTable(role);
    const columns = Object.keys(profilePayload);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `
        INSERT INTO ${table} (actor_id, ${columns.join(', ')})
        VALUES (?, ${placeholders})
    `;

    await queryD1(sql, [actorId, ...columns.map((column) => profilePayload[column])]);
}

async function createActorWithProfile({ role, email, password, documentHash, profilePayload }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const wallet = ethers.Wallet.createRandom();
    const normalizedEmail = email.trim().toLowerCase();

    await queryD1(
        `
            INSERT INTO actors (
                email,
                password_hash,
                app_role,
                wallet_address,
                private_key,
                document_hash
            ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            normalizedEmail,
            hashedPassword,
            role,
            wallet.address,
            wallet.privateKey,
            documentHash || null,
        ],
    );

    const actor = await findActorByRoleAndEmail(role, normalizedEmail);
    if (!actor) {
        throw new Error('Aktor gagal dibuat.');
    }

    try {
        await insertProfile(role, actor.id, profilePayload);
    } catch (error) {
        await queryD1('DELETE FROM actors WHERE id = ?', [actor.id]);
        throw error;
    }

    return findActorByRoleAndEmail(role, normalizedEmail);
}

async function findActorByRoleAndEmail(role, email) {
    const profileTable = pickProfileTable(role);
    const actor = getFirstRow(
        await queryD1(
            `
                SELECT
                    a.id,
                    a.email,
                    a.app_role,
                    a.wallet_address,
                    a.private_key,
                    a.password_hash,
                    a.document_hash,
                    a.status_verifikasi,
                    a.approved_tx_hash,
                    a.approved_at,
                    a.created_at,
                    a.updated_at,
                    p.*
                FROM actors a
                LEFT JOIN ${profileTable} p ON p.actor_id = a.id
                WHERE a.app_role = ? AND a.email = ?
                LIMIT 1
            `,
            [role, email.trim().toLowerCase()],
        ),
    );

    if (!actor) {
        return null;
    }

    return {
        ...actor,
        profile: mapProfileFields(role, actor),
    };
}

async function findActorByRoleAndId(role, actorId) {
    const profileTable = pickProfileTable(role);
    const actor = getFirstRow(
        await queryD1(
            `
                SELECT
                    a.id,
                    a.email,
                    a.app_role,
                    a.wallet_address,
                    a.private_key,
                    a.password_hash,
                    a.document_hash,
                    a.status_verifikasi,
                    a.approved_tx_hash,
                    a.approved_at,
                    a.created_at,
                    a.updated_at,
                    p.*
                FROM actors a
                LEFT JOIN ${profileTable} p ON p.actor_id = a.id
                WHERE a.app_role = ? AND a.id = ?
                LIMIT 1
            `,
            [role, actorId],
        ),
    );

    if (!actor) {
        return null;
    }

    return {
        ...actor,
        profile: mapProfileFields(role, actor),
    };
}

async function findActorById(actorId) {
    const actor = getFirstRow(
        await queryD1(
            `
                SELECT
                    id,
                    email,
                    app_role,
                    wallet_address,
                    private_key,
                    password_hash,
                    document_hash,
                    status_verifikasi,
                    approved_tx_hash,
                    approved_at,
                    created_at,
                    updated_at
                FROM actors
                WHERE id = ?
                LIMIT 1
            `,
            [actorId],
        ),
    );

    if (!actor) {
        return null;
    }

    return findActorByRoleAndId(actor.app_role, actor.id);
}

async function updateActorVerification(actorId, status, txHash = null) {
    await queryD1(
        `
            UPDATE actors
            SET
                status_verifikasi = ?,
                approved_tx_hash = ?,
                approved_at = CASE WHEN ? IS NULL THEN approved_at ELSE CURRENT_TIMESTAMP END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `,
        [status, txHash, txHash, actorId],
    );
}

async function deleteActorById(actorId) {
    await queryD1('DELETE FROM actors WHERE id = ?', [actorId]);
}

async function validateRolePassword({ role, email, password }) {
    const actor = await findActorByRoleAndEmail(role, email);
    if (!actor) {
        return { actor: null, isPasswordValid: false };
    }

    const isPasswordValid = await bcrypt.compare(password, actor.password_hash);
    return { actor, isPasswordValid };
}

async function findGovAdminByEmail(email) {
    return getFirstRow(
        await queryD1(
            `
                SELECT id, email, full_name, password_hash, is_active
                FROM gov_admins
                WHERE email = ?
                LIMIT 1
            `,
            [email.trim().toLowerCase()],
        ),
    );
}

module.exports = {
    createActorWithProfile,
    deleteActorById,
    findActorById,
    findActorByRoleAndEmail,
    findActorByRoleAndId,
    validateRolePassword,
    updateActorVerification,
    findGovAdminByEmail,
};
