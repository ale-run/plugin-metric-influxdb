"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRepository = void 0;
const runtime_1 = require("@ale-run/runtime");
const Utils_1 = require("../../Utils");
const MemoryMapper_1 = require("./MemoryMapper");
const logger = runtime_1.Logger.getLogger('metric:MemoryRepository');
class MemoryRepository {
    //중복
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
            |> filter(fn: (r) => r["_field"] == "memory_usage_bytes")`;
        }
        else {
            query += `
            |> filter(fn: (r) => r["_field"] == "resource_limits_memory_bytes")`;
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
    getGroupQuery(interval, groupColumns) {
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
    getMemoryUsage(client, namespace, s, e, u, desc, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, true, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
        query += this.getGroupQuery(u, groupColumns);
        query += `
            |> sort(columns: ["_time"], desc: ${desc})
            |> drop(columns: ["_start", "_stop"])`;
        const p = client.collectRows(query, MemoryMapper_1.MemoryMapper.rowMapper);
        return p;
    }
    getMemoryLimit(client, namespace, s, e, u, desc, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, false, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
        query += this.getGroupQuery(u, groupColumns);
        query += `
            |> sort(columns: ["_time"], desc: ${desc})
            |> drop(columns: ["_start", "_stop"])`;
        const p = client.collectRows(query, MemoryMapper_1.MemoryMapper.rowMapper);
        return p;
    }
    getMemoryCount(client, namespace, s, e, u, isEmpty, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, isEmpty, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
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
    getMemoryUsageCount(client, namespace, s, e, u, controller, pod) {
        return this.getMemoryCount(client, namespace, s, e, u, true, controller, pod);
    }
    getMemoryLimitCount(client, namespace, s, e, u, controller, pod) {
        return this.getMemoryCount(client, namespace, s, e, u, false, controller, pod);
    }
}
exports.MemoryRepository = MemoryRepository;
//# sourceMappingURL=MemoryRepository.js.map