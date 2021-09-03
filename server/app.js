'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const path = require('path');
const util = require('util')
const stream = require('stream')
const csv = require('fast-csv');
const { fileURLToPath } = require('url');

const filename = 'tree_data.csv';

const init = async () => {

    const server = Hapi.server({
        port: 3001,
        host: 'localhost',
        routes: {
            cors: true
        }
    });

    const writeToCSV = (json_data) => {
        let csv_data = json_data[0].join('\t')
        json_data.shift()
        json_data.forEach(row => csv_data += '\n' + row.join('\t'))
        const fsPromise = util.promisify(fs.writeFile);
        return fsPromise(filename, csv_data)
            .then(() => ({ status: 'ok' }))
            .catch(() => console.log('Error writing to csv file', err));
    };

    const readCSV = async () => {
        const finished = util.promisify(stream.finished);
        let result = []
        let rs = fs.createReadStream(filename)
            .pipe(csv.parse({ delimiter: '\t' }))
            .on('error', error => console.log(error))
            .on('data', row => row.length > 0 && result.push(row))
        await finished(rs)
        return result
    }

    server.route({
        method: 'GET',
        path: '/get',
        handler: async (request, h) => {
            return readCSV()
        }
    });

    server.route({
        method: 'GET',
        path: '/update',
        handler: async (request, h) => {
            let json_data = await readCSV();
            // ....json_data...
            return writeToCSV(json_data)
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();