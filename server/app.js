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
        host: '0.0.0.0',
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

    await server.register(require('@hapi/inert'));

    server.route({
        method: 'GET',
        path: '/download',
        handler: async (request, h) => {
            return h.file(filename, {
                mode: 'attachment',
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/createNode',
        handler: async (request, h) => {
            let json_data = await readCSV();
            let length = json_data.length;
            let data = request.payload;

            for (let i = 1; i < length; i++) {
                console.log(data.parent, json_data[i][0]);
                if (data.parent == '0' || json_data[i][0] == data.parent) {
                    let id = parseInt(json_data[length - 1][0]) + 1;
                    let newNode = [id.toString(), ...Object.values(data)];
                    json_data.push(newNode);
                    writeToCSV(json_data);
                    return id;

                }
            }
            return "error";
        }
    });

    server.route({
        method: 'POST',
        path: '/updateNode',
        handler: async (request, h) => {
            let json_data = await readCSV();
            let length = json_data.length;
            let data = request.payload;
            for (let i = 1; i < length; i++) {
                if (json_data[i][0] == data.id) {
                    json_data[i][1] = data.name;

                    return "success";

                }
            }
            return "error";
        }
    });

    server.route({
        method: 'POST',
        path: '/deleteNode',
        handler: async (request, h) => {

            let json_data = await readCSV();
            let length = json_data.length;
            let data = request.payload;

            for (var i = 1; i < json_data.length;) {
                console.log(i);
                if (json_data[i][0] == data.id || json_data[i][3] == data.id) {
                    json_data.splice(i, 1);

                } else {
                    i++;
                }

            }
            if (json_data.length == length) {
                return "error";
            }
            writeToCSV(json_data);
            return "success";

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