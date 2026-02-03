import { ProtocolIdentifier } from '../types';
export interface AttachOptions {
    protocol: ProtocolIdentifier;
    slot: string;
    componentToken?: any;
    payload?: any;
}
export declare const Attach: ((options: AttachOptions) => (target: any, propertyKey?: string) => void) & {
    Add: (options: AttachOptions) => (target: any, propertyKey?: string) => void;
    Exclude: (options: AttachOptions) => (target: any, propertyKey?: string) => void;
    Reset: (options: AttachOptions) => (target: any, propertyKey?: string) => void;
};
