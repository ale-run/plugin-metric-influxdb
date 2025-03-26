import { Logger } from '@ale-run/runtime';
import { InfluxdbClient } from '../InfluxdbClient';
import { Utils } from '../../Utils';
import { Traffic } from './Traffic';
import { TrafficMapper } from './TrafficMapper';
import { unsubscribe } from 'node:diagnostics_channel';

const logger = Logger.getLogger('metric:TrafficRepository');

export class TrafficRepository {
  getGroupColumns(controller?: string, pod?: string): string[] {
    let groupColumns: string[] = ['"namespace", "_field"'];
    if (!Utils.isEmpty(controller)) groupColumns.push('"controller_name"');
    if (!Utils.isEmpty(pod)) groupColumns.push('"pod_name"');
    return groupColumns;
  }

  getFilterQuery(client: InfluxdbClient, namespace: string, s: Date, e: Date, gress: string, controller?: string, pod?: string): string {
    let query = `
        from(bucket: "${client.api_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "kubernetes_controller_network")`;

    if (gress === 'i') {
      query += `
            |> filter(fn: (r) => r["_field"] == "rx_bytes")`;
    } else if (gress === 'e') {
      query += `
            |> filter(fn: (r) => r["_field"] == "tx_bytes")`;
    } else {
      query += `
            |> filter(fn: (r) => r["_field"] == "rx_bytes" or r["_field"] == "tx_bytes")`;
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

  getTrafficUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, gress: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Traffic>> {
    let query = this.getFilterQuery(client, namespace, s, e, gress, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);
    //query += this.getGroupQuery(this.getInterval(u), groupColumns)
    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}])  
            |> aggregateWindow(every: ${u} , fn: sum, createEmpty: true)
            |> sort(columns: ["_time"], desc: ${desc})
            |> map(fn: (r) => ({r with _value: if exists r._value then r._value else 0,}))
            |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> drop(columns: ["_start", "_stop"])`;

    const p = client.collectRows(query, TrafficMapper.rowMapper);
    return p;
  }

  getTrafficUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, gress: string, controller?: string, pod?: string): Promise<Array<string>> {
    let query = this.getFilterQuery(client, namespace, s, e, gress, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);

    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}])  
            |> aggregateWindow(every: ${u} , fn: last, createEmpty: true)
            |> count()
            |> keep(columns: ["_value"])`;

    const p = client.collectRows(query, (values, tableMeta) => tableMeta.get(values, '_value'));
    return p;
  }
}
