import { InfluxdbClient } from '../InfluxdbClient';
import { Memory } from './Memory';
export declare class MemoryRepository {
    getGroupColumns(controller?: string, pod?: string): string[];
    getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, isUsage?: boolean, controller?: string, pod?: string): string;
    getGroupQuery(interval: string, groupColumns: string[]): string;
    getMemoryUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Memory>>;
    getMemoryLimit(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Memory>>;
    getMemoryCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, isEmpty: boolean, controller?: string, pod?: string): Promise<Array<string>>;
    getMemoryUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>>;
    getMemoryLimitCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>>;
}
