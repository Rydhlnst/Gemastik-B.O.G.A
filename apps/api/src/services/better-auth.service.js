const fs = require('node:fs');
const path = require('node:path');

const ROLE_EMAIL_SCOPE_PREFIX = 'boga-role';
const BETTER_AUTH_DUPLICATE_USER_CODE = 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL';
const BETTER_AUTH_INVALID_CREDENTIAL_CODE = 'INVALID_EMAIL_OR_PASSWORD';

let resourcesPromise = null;

function normalizeEmail(email) {
    if (typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
}

function roleScopedEmail(role, email) {
    const normalizedEmail = normalizeEmail(email);
    const [local, domain] = normalizedEmail.split('@');

    if (!local || !domain) {
        throw new Error('Email tidak valid untuk sinkronisasi Better Auth.');
    }

    const safeRole = String(role || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');

    return `${local}+${ROLE_EMAIL_SCOPE_PREFIX}-${safeRole}@${domain}`;
}

function displayNameFromEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const [local] = normalizedEmail.split('@');
    return local || 'B.O.G.A User';
}

function getBetterAuthErrorCode(error) {
    return (
        error?.body?.code ||
        error?.code ||
        null
    );
}

function isDuplicateUserError(error) {
    return getBetterAuthErrorCode(error) === BETTER_AUTH_DUPLICATE_USER_CODE;
}

function isInvalidCredentialError(error) {
    return getBetterAuthErrorCode(error) === BETTER_AUTH_INVALID_CREDENTIAL_CODE;
}

async function initBetterAuthResources() {
    const [{ betterAuth }, { bearer }, { toNodeHandler }, betterSqlite3] = await Promise.all([
        import('better-auth'),
        import('better-auth/plugins'),
        import('better-auth/node'),
        import('better-sqlite3'),
    ]);

    const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('BETTER_AUTH_SECRET atau JWT_SECRET wajib diisi.');
    }

    const dataDir = process.env.BETTER_AUTH_DATA_DIR || path.resolve(process.cwd(), 'data');
    fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = process.env.BETTER_AUTH_DB_PATH || path.join(dataDir, 'better-auth.sqlite');
    const Database = betterSqlite3.default;
    const database = new Database(dbPath);

    const auth = betterAuth({
        secret,
        baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
        basePath: process.env.BETTER_AUTH_BASE_PATH || '/api/auth/ba',
        database,
        emailAndPassword: {
            enabled: true,
        },
        user: {
            additionalFields: {
                role: {
                    type: 'string',
                    required: true,
                    input: true,
                },
                actorId: {
                    type: 'number',
                    required: false,
                    input: true,
                },
                verificationStatus: {
                    type: 'string',
                    required: false,
                    input: true,
                },
            },
        },
        plugins: [bearer()],
    });

    const context = await auth.$context;
    await context.runMigrations();

    return {
        auth,
        toNodeHandler,
        nodeHandler: toNodeHandler(auth),
    };
}

async function getResources() {
    if (!resourcesPromise) {
        resourcesPromise = initBetterAuthResources();
    }
    return resourcesPromise;
}

async function registerRoleCredential({
    role,
    email,
    password,
    actorId,
    verificationStatus,
    displayName,
}) {
    const { auth } = await getResources();

    const body = {
        name: displayName || displayNameFromEmail(email),
        email: roleScopedEmail(role, email),
        password,
        role,
    };

    if (Number.isInteger(actorId) && actorId > 0) {
        body.actorId = actorId;
    }
    if (typeof verificationStatus === 'string' && verificationStatus.trim()) {
        body.verificationStatus = verificationStatus.trim();
    }

    return auth.api.signUpEmail({ body });
}

async function ensureRoleCredential(payload) {
    try {
        await registerRoleCredential(payload);
        return { created: true };
    } catch (error) {
        if (isDuplicateUserError(error)) {
            return { created: false };
        }
        throw error;
    }
}

async function signInRoleCredential({ role, email, password }) {
    const { auth } = await getResources();
    return auth.api.signInEmail({
        body: {
            email: roleScopedEmail(role, email),
            password,
        },
    });
}

async function handleBetterAuthRequest(req, res) {
    const { nodeHandler } = await getResources();
    return nodeHandler(req, res);
}

module.exports = {
    ensureRoleCredential,
    signInRoleCredential,
    handleBetterAuthRequest,
    getBetterAuthErrorCode,
    isDuplicateUserError,
    isInvalidCredentialError,
};
