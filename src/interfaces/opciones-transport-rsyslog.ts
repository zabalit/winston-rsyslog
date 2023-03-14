import * as Transport from 'winston-transport';
import {OuptputFormat} from '../enums/output-format';
import {Protocol} from '../enums/protocol';

export interface IOpcionesTransportRsyslog extends Transport.TransportStreamOptions {
    host: string;
    port: number;
    facility: number;
    protocol: Protocol;
    hostname: string;
    tag: string;
    outputFormat: OuptputFormat;
    silent?: boolean;
}
