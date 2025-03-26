import { Logger } from '@ale-run/runtime';
import { InfluxdbClient } from '../InfluxdbClient';
import { Utils } from '../../Utils';
import { Nginx } from './Nginx';
import { NginxMapper } from './NginxMapper';

const logger = Logger.getLogger('metric:NginxRepository');

export class NginxRepository {
  getGroupColumns(controller?: string, pod?: string): string[] {
    let groupColumns: string[] = ['"namespace", "_field"'];
    if (!Utils.isEmpty(controller)) groupColumns.push('"controller_name"');
    if (!Utils.isEmpty(pod)) groupColumns.push('"pod_name"');
    return groupColumns;
  }

  getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, service?: string): string {
    let query = `
        from(bucket: "${client.log_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "ingress-nginx" or r["_measurement"] == "ingress-nginx-2xx")
            |> filter(fn: (r) => r["_field"] == "http_referer")`;

    if (!Utils.isEmpty(namespace)) {
      query += `
            |> filter(fn: (r) => r["backend_namespace"] == "${namespace}")`;
    }

    if (!Utils.isEmpty(service)) {
      query += `
            |> filter(fn: (r) => r["service_name"] == "${service}")`;
    }
    return query;
  }

  getStatusCodeAggregate(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, service?: string): Promise<Array<Nginx>> {
    let query = this.getFilterQuery(client, namespace, s, e, service);
    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: ["status"])  
            |> aggregateWindow(every: ${u} , fn: count, createEmpty: true)
            |> sort(columns: ["_time"], desc: ${desc})
            |> pivot(rowKey: ["_time"], columnKey: ["status"], valueColumn: "_value")
            |> drop(columns: ["_start", "_stop"])`;

    const p = client.collectRows(query, NginxMapper.rowMapper);
    //const p = client.getQueryApi().queryRaw(query);
    return p;
  }

  getStatusCodeAggregateCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, service?: string): Promise<Array<string>> {
    let query = this.getFilterQuery(client, namespace, s, e, service);

    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: ["status"])  
            |> aggregateWindow(every: ${u} , fn: last, createEmpty: true)
            |> count()
            |> keep(columns: ["_value"])`;

    const p = client.collectRows(query, (values, tableMeta) => tableMeta.get(values, '_value'));
    return p;
  }
}
