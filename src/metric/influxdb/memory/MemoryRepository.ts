import { Logger } from '@ale-run/runtime';
import { InfluxdbClient } from '../InfluxdbClient';
import { Utils } from '../../Utils';
import { MemoryMapper } from './MemoryMapper';
import { Memory } from './Memory';

const logger = Logger.getLogger('metric:MemoryRepository');

export class MemoryRepository {
  //중복
  getGroupColumns(controller?: string, pod?: string): string[] {
    let groupColumns: string[] = ['"namespace"'];
    if (!Utils.isEmpty(controller)) groupColumns.push('"controller_name"');
    if (!Utils.isEmpty(pod)) groupColumns.push('"pod_name"');
    return groupColumns;
  }

  getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, isUsage = true, controller?: string, pod?: string): string {
    let query = `
        from(bucket: "${client.api_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "kubernetes_pod_container")`;

    if (isUsage) {
      query += `
            |> filter(fn: (r) => r["_field"] == "memory_usage_bytes")`;
    } else {
      query += `
            |> filter(fn: (r) => r["_field"] == "resource_limits_memory_bytes")`;
    }

    if (!Utils.isEmpty(namespace)) {
      query += `
            |> filter(fn: (r) => r["namespace"] == "${namespace}")`;
    }

    if (!Utils.isEmpty(controller)) {
      query += `
            |> filter(fn: (r) => r["controller_name"] == "${controller}")`;
    }

    if (!Utils.isEmpty(pod)) {
      query += `
            |> filter(fn: (r) => r["pod_name"] == "${pod}")`;
    }

    return query;
  }

  getGroupQuery(interval: string, groupColumns: string[]): string {
    let query = `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: 1m , fn: sum, createEmpty: true)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: ${interval} , fn: mean, createEmpty: true)
            |> map(
                fn: (r) => ({r with _value: 
                    if exists r._value then
                       int(v: r._value / 1024.0 / 1024.0)
                       //int(v:r._value)
                    else
                        0,
                }),
                )
            |> drop(columns: ["_start", "_stop"])`;

    return query;
  }

  getMemoryUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Memory>> {
    let query = this.getFilterQuery(client, namespace, s, e, true, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);
    query += this.getGroupQuery(u, groupColumns);

    query += `
            |> sort(columns: ["_time"], desc: ${desc})
            |> drop(columns: ["_start", "_stop"])`;

    const p = client.collectRows(query, MemoryMapper.rowMapper);
    return p;
  }

  getMemoryLimit(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Memory>> {
    let query = this.getFilterQuery(client, namespace, s, e, false, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);
    query += this.getGroupQuery(u, groupColumns);

    query += `
            |> sort(columns: ["_time"], desc: ${desc})
            |> drop(columns: ["_start", "_stop"])`;

    const p = client.collectRows(query, MemoryMapper.rowMapper);
    return p;
  }

  getMemoryCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, isEmpty: boolean, controller?: string, pod?: string): Promise<Array<string>> {
    let query = this.getFilterQuery(client, namespace, s, e, isEmpty, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);

    query += `
            |> truncateTimeColumn(unit: 1m)
            //|> group(columns: [${groupColumns}]) 
            //|> aggregateWindow(every: 1m , fn: sum, createEmpty: true)
            |> group(columns: [${groupColumns}])
            |> aggregateWindow(every: ${u} , fn: last, createEmpty: true)
            |> count()
            |> keep(columns: ["_value"])`;

    const p = client.collectRows(query, (values, tableMeta) => tableMeta.get(values, '_value'));
    return p;
  }

  getMemoryUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>> {
    return this.getMemoryCount(client, namespace, s, e, u, true, controller, pod);
  }

  getMemoryLimitCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>> {
    return this.getMemoryCount(client, namespace, s, e, u, false, controller, pod);
  }
}
