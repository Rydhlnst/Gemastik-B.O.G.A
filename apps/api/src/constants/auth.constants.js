const APP_ROLE = {
    VENDOR: 'VENDOR',
    SPPG: 'SPPG',
    LOGISTIK: 'LOGISTIK',
    SCHOOL: 'SCHOOL',
};

const ADMIN_ROLE = 'GOVERNMENT_ADMIN';

const BLOCKCHAIN_ROLE = {
    [APP_ROLE.VENDOR]: 1,
    [APP_ROLE.SPPG]: 2,
    [APP_ROLE.LOGISTIK]: 3,
    [APP_ROLE.SCHOOL]: 4,
};

const ROLE_PARAM_TO_APP_ROLE = {
    vendor: APP_ROLE.VENDOR,
    sppg: APP_ROLE.SPPG,
    logistik: APP_ROLE.LOGISTIK,
    logistic: APP_ROLE.LOGISTIK,
    sekolah: APP_ROLE.SCHOOL,
    school: APP_ROLE.SCHOOL,
};

const VERIFICATION_STATUS = {
    PENDING: 'PENDING_VERIFICATION',
    ACTIVE: 'ACTIVE',
    REJECTED: 'REJECTED',
    FROZEN: 'FROZEN',
};

const PROFILE_TABLE_BY_ROLE = {
    [APP_ROLE.VENDOR]: 'actor_profile_vendor',
    [APP_ROLE.SPPG]: 'actor_profile_sppg',
    [APP_ROLE.LOGISTIK]: 'actor_profile_logistik',
    [APP_ROLE.SCHOOL]: 'actor_profile_school',
};

module.exports = {
    APP_ROLE,
    ADMIN_ROLE,
    BLOCKCHAIN_ROLE,
    ROLE_PARAM_TO_APP_ROLE,
    VERIFICATION_STATUS,
    PROFILE_TABLE_BY_ROLE,
};
