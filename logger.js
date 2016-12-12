/**
 * Created by wisp on 2016/8/2.
 */
var winston = require('winston');
var logger = new (winston.Logger)({
    //level: 'info',
    transports: [
        new (winston.transports.Console)({ level: 'debug' }),
        new (winston.transports.File)({ filename: '../helper.log' })
    ]
});

module.exports = logger;