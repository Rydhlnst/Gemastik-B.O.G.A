const bcrypt = require('bcrypt');
async function gen() {
    const hash = await bcrypt.hash('hash123', 10);
    console.log('HASH UNTUK hash123:', hash);
}
gen();
