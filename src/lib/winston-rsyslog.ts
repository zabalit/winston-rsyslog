import * as Transport from 'winston-transport';
import {IOpcionesTransportRsyslog} from '../interfaces/opciones-transport-rsyslog';
import {NivelesLogRsyslog} from '../enums/niveles-log-rsyslog';
import {NPM_TO_SYSLOG_LEVEL_MAP} from '../constantes/npm-syslog-level-map';
import {OuptputFormat} from '../enums/output-format';
import {Protocol} from '../enums/protocol';
import {NivelesLog} from '../enums/niveles-log';

const dgram = require('dgram');
const net = require('net');
const os = require('os');

const propNoMeta = ['level', 'message', 'timestamp'];

export class RsyslogTransport extends Transport {
    name: string;

    host: string;
    port: number;
    facility: number;
    protocol: string;
    hostname: string;
    tag: string;
    outputformat: OuptputFormat;

    silent?: boolean;

    constructor(options: IOpcionesTransportRsyslog) {
        super(options);
        options = options || {};
        this.name = 'rsyslog';
        this.host = options.host || 'localhost';
        this.port = options.port || 514;
        this.facility = options.facility || 0;
        this.protocol = options.protocol || Protocol.UDP;
        this.hostname = options.hostname || os.hostname();
        this.tag = options.tag || 'winston';
        this.silent = options.silent;
        this.outputformat = options.outputFormat || OuptputFormat.TEXT;

        if (this.facility > 23 || this.facility < 0) {
            console.log('Facility index is out of range (0..23) !');
            return;
        }

        if (this.protocol !== Protocol.UDP && this.protocol !== Protocol.TCP) {
            console.log('Undefined Protocol (valid options are U or T) !');
            return;
        }
    }

    log(info: any, callback: null | ((any: any, boolean: boolean) => any)): any {
        if (this.silent) {
            if (callback != null) {
                return callback(null, true);
            } else {
                return;
            }
        }

        const level: NivelesLog = info.level;
        const msg: string = info.message;

        const self = this;

        // If the specified level is not included in syslog list, convert it into "debug".
        let _severity = 7;
        // @ts-ignore
        const nivelMap = NivelesLogRsyslog[NPM_TO_SYSLOG_LEVEL_MAP[level]];
        if (nivelMap !== undefined) {
            // @ts-ignore
            _severity = nivelMap;
        }

        // tslint:disable-next-line:no-bitwise
        const _pri = (this.facility << 3) + _severity;
        let _date;
        if (info.timestamp != null) {
            _date = info.timestamp;
        } else {
            _date = new Date().toISOString();
        }

        const _buffer = this.createBuffer(_pri, _date, this.tag, level, msg, this.getMeta(info), this.outputformat);

        if (this.protocol === Protocol.UDP) {
            const client = dgram.createSocket('udp4');
            client.send(_buffer, 0, _buffer.length, this.port, this.host, function (err: Error | null, bytes: number) {
                if (err) {
                    client.close();
                    console.log('Error enviando log a rsyslog', err);
                    return;
                }

                self.emit('logged');

                if (callback) {
                    callback(null, true);
                }
                callback = null;

                client.close();
            });
        }

        if (this.protocol === Protocol.TCP) {
            const socket = net.connect(this.port, this.host, function () {
                socket.end(_buffer + '\n');

                self.emit('logged');

                if (callback) {
                    callback(null, true);
                }
                callback = null;

            });

            socket.setTimeout(10000);

            // Cuando hay un error no se puede emitir un evento error porque eso haría que intentase generarse otro log de error y entraría en bucle.
            // Si metemos el error en la función socket.destroy() o en el primer parámetro del callback, hacen throw del error y se para el servidor.
            // Dejamos que falle en silencio
            socket.on('error', function (err: Error) {
                console.log('Error enviando log a rsyslog', err);
                socket.destroy();
                if (callback) {
                    callback(null, true);
                }
            });

            socket.on('timeout', function () {
                console.log('Timeout enviando log a rsyslog');
                socket.destroy();
                if (callback) {
                    callback(null, true);
                }
            });
        }
    }

    private getMeta(info: any): any {
        const obj: any = {};
        for (const prop in info) {
            if (info.hasOwnProperty(prop) && propNoMeta.indexOf(prop) === -1) {
                obj[prop] = info[prop];
            }
        }
        return obj;
    }

    private createBuffer(pri: number, date: string, tag: string, level: NivelesLog, msg: string, meta: any, outputFormat: OuptputFormat): Buffer {
        let str = '<' + pri + '>' + date + ' ' + tag + ' ' + level +
            ' - ' + msg;

        if (meta != null && Object.keys(meta).length > 0) {
            if (outputFormat === OuptputFormat.TEXT) {
                for (const prop in meta) {
                    str += ' - ' + prop + ':' + meta[prop];
                }
            } else {
                str += ' - ' + JSON.stringify(meta);
            }
        }

        return new Buffer(str);
    }

}
