const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BogaVendorRegistryModule", (m) => {
    // Mendeploy BogaVendorRegistry ke jaringan lokal
    const bogaVendor = m.contract("BogaVendorRegistry");

    return { bogaVendor };
});