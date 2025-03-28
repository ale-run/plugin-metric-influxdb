import { InfluxdbClient } from '../InfluxdbClient';
import { Cpu } from './Cpu';
export declare class CpuRepository {
    getGroupColumns(controller?: string, pod?: string): string[];
    getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, isUsage?: boolean, controller?: string, pod?: string): string;
    getCpuUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Cpu>>;
    getCpuLimit(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Cpu>>;
    getCpuCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, isEmpty: boolean, controller?: string, pod?: string): Promise<Array<string>>;
    getCpuUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>>;
    getCpuLimitCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>>;
}
