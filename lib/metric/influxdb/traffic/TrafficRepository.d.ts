import { InfluxdbClient } from '../InfluxdbClient';
import { Traffic } from './Traffic';
export declare class TrafficRepository {
    getGroupColumns(controller?: string, pod?: string): string[];
    getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, gress: string, controller?: string, pod?: string): string;
    getTrafficUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, gress: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Traffic>>;
    getTrafficUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, gress: string, controller?: string, pod?: string): Promise<Array<string>>;
}
