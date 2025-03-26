import { Logger } from '@ale-run/runtime';
import { InfluxdbClient } from '../InfluxdbClient';
import { Utils } from '../../Utils';
import { Cpu } from './Cpu';
import { CpuMapper } from './CpuMapper';

const logger = Logger.getLogger('metric:CpuRepository');

export class CpuRepository {
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
            |> filter(fn: (r) => r["_field"] == "cpu_usage_nanocores")`;
    } else {
      query += `
            |> filter(fn: (r) => r["_field"] == "resource_limits_millicpu_units")`;
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

  getCpuUsage(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Cpu>> {
    let query = this.getFilterQuery(client, namespace, s, e, true, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);

    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: 1m , fn: sum, createEmpty: true)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: ${u} , fn: mean, createEmpty: true)
            //|> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> map(
                fn: (r) => ({r with _value: 
                    if exists r._value then
                        int(v: r._value / 1000000.0)
                        //int(v: r._value)
                    else
                        0,
                }),
            )
            |> sort(columns: ["_time"], desc: ${desc})
            |> drop(columns: ["_start", "_stop"])
        `;
    const p = client.collectRows(query, CpuMapper.rowMapper);
    return p;
  }

  getCpuLimit(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, desc: boolean, controller?: string, pod?: string): Promise<Array<Cpu>> {
    let query = this.getFilterQuery(client, namespace, s, e, false, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);

    query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: 1m , fn: sum, createEmpty: true)
            |> group(columns: [${groupColumns}]) 
            |> aggregateWindow(every: ${u} , fn: mean, createEmpty: true)
            |> sort(columns: ["_time"], desc: ${desc})
            |> map(fn: (r) => ({r with _value: if exists r._value then int(v: r._value) else 0,}))
            //|> rename(columns: {_value: "resource_limits_millicpu_units"})
            |> drop(columns: ["_start", "stop"])
        `;
    const p = client.collectRows(query, CpuMapper.rowMapper);
    return p;
  }

  getCpuCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, isEmpty: boolean, controller?: string, pod?: string): Promise<Array<string>> {
    let query = this.getFilterQuery(client, namespace, s, e, isEmpty, controller, pod);

    let groupColumns: string[] = this.getGroupColumns(controller, pod);

    query += `
            |> truncateTimeColumn(unit: 1m)
            //|> group(columns: [${groupColumns}]) 
            //|> aggregateWindow(every: 1m , fn: sum, createEmpty: true)
            |> group(columns: [${groupColumns}])
            |> aggregateWindow(every: ${u} , fn: last, createEmpty: true)
            |> count()
            |> keep(columns: ["_value"])
        `;
    const p = client.collectRows(query, (values, tableMeta) => tableMeta.get(values, '_value'));
    return p;
  }

  getCpuUsageCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>> {
    return this.getCpuCount(client, namespace, s, e, u, true, controller, pod);
  }

  getCpuLimitCount(client: InfluxdbClient, namespace: string, s: Date, e: Date, u: string, controller?: string, pod?: string): Promise<Array<string>> {
    return this.getCpuCount(client, namespace, s, e, u, false, controller, pod);
  }
}
