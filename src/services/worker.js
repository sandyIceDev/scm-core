const mongoose = require('mongoose');

async function initdb() {
    let MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
    let MONGO_PORT = process.env.MONGO_PORT || 27017;
    let MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME || 'scm';
    let MONGO_USERNAME = process.env.MONGO_USERNAME || '';
    let MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
    let options = {ssl:false};
    if (MONGO_USERNAME !== '')
        options.authSource = 'admin'
    let uri = `mongodb://${MONGO_USERNAME != '' ? MONGO_USERNAME+":"+MONGO_PASSWORD+"@" : ""}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE_NAME}`
    await mongoose.connect(uri,options);
}
module.exports = {
    initdb
}