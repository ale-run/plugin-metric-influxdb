"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuRepository = void 0;
const runtime_1 = require("@ale-run/runtime");
const Utils_1 = require("../../Utils");
const CpuMapper_1 = require("./CpuMapper");
const logger = runtime_1.Logger.getLogger('metric:CpuRepository');
class CpuRepository {
    getGroupColumns(controller, pod) {
        let groupColumns = ['"namespace"'];
        if (!Utils_1.Utils.isEmpty(controller))
            groupColumns.push('"controller_name"');
        if (!Utils_1.Utils.isEmpty(pod))
            groupColumns.push('"pod_name"');
        return groupColumns;
    }
    getFilterQuery(client, namespace, s, e, isUsage = true, controller, pod) {
        let query = `
          from(bucket: "${client.api_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "kubernetes_pod_container")`;
        if (isUsage) {
            query += `
            |> filter(fn: (r) => r["_field"] == "cpu_usage_nanocores")`;
        }
        else {
            query += `
            |> filter(fn: (r) => r["_field"] == "resource_limits_millicpu_units")`;
        }
        if (!Utils_1.Utils.isEmpty(namespace)) {
            query += `
            |> filter(fn: (r) => r["namespace"] == "${namespace}")`;
        }
        if (!Utils_1.Utils.isEmpty(controller)) {
            query += `
            |> filter(fn: (r) => r["controller_name"] == "${controller}")`;
        }
        if (!Utils_1.Utils.isEmpty(pod)) {
            query += `
            |> filter(fn: (r) => r["pod_name"] == "${pod}")`;
        }
        return query;
    }
    getCpuUsage(client, namespace, s, e, u, desc, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, true, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
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
        const p = client.collectRows(query, CpuMapper_1.CpuMapper.rowMapper);
        return p;
    }
    getCpuLimit(client, namespace, s, e, u, desc, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, false, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
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
        const p = client.collectRows(query, CpuMapper_1.CpuMapper.rowMapper);
        return p;
    }
    getCpuCount(client, namespace, s, e, u, isEmpty, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, isEmpty, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
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
    getCpuUsageCount(client, namespace, s, e, u, controller, pod) {
        return this.getCpuCount(client, namespace, s, e, u, true, controller, pod);
    }
    getCpuLimitCount(client, namespace, s, e, u, controller, pod) {
        return this.getCpuCount(client, namespace, s, e, u, false, controller, pod);
    }
}
exports.CpuRepository = CpuRepository;
//# sourceMappingURL=CpuRepository.js.map