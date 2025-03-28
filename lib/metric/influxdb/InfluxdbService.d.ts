import { AnyObject } from '@ale-run/runtime';
import { InfluxdbClient } from './InfluxdbClient';
export declare class InfluxdbService {
    getInfluxdbClient(env: AnyObject): InfluxdbClient;
    getInterval(u: string): string;
}
