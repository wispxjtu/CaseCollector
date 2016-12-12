let configuration = null;
let fs = require("fs");
let logger = require("./logger");

if (fs.existsSync('./configuration.json')){
    configuration = require('./configuration.json');
}
else {
    configuration = {
        "dbInfo" :{
            "host": "localhost"
        },
        "sync": {
            "begin_date": "2015-06-30T16:00:00.000Z",
            "department": []
        },

        "elasticsearch": {
            "host": "localhost:9200",
            "log": "trace"
        }
    }
}
logger.info(configuration);
module.exports = configuration;
