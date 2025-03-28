import { InfluxdbClient } from '../InfluxdbClient';
import { Nginx } from './Nginx';
export declare class NginxRepository {
    getGroupColumns(controller?: string, pod?: string): string[];
    getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, service?: string): string;
    getStatusCodeAggregate(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, service?: string): Promise<Array<Nginx>>;
    getStatusCodeAggregateCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, service?: string): Promise<Array<string>>;
}
