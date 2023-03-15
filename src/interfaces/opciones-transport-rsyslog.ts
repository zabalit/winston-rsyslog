import * as Transport from 'winston-transport';
import {OuptputFormat} from '../enums/output-format';
import {Protocol} from '../enums/protocol';
import {NivelesLog} from '../enums/niveles-log';

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
