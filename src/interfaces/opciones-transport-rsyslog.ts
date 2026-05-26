import Transport from 'winston-transport';
import {OuptputFormat} from '../enums/output-format.js';
import {Protocol} from '../enums/protocol.js';
import {NivelesLog} from '../enums/niveles-log.js';

export interface IOpcionesTransportRsyslog extends Transport.TransportStreamOptions {
    host: string;
    port: number;
    facility: number;
    protocol: Protocol;
    hostname: string;
    tag: string;
    level: NivelesLog;
    outputFormat: OuptputFormat;
    silent?: boolean;
}
