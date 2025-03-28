"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxRepository = void 0;
const runtime_1 = require("@ale-run/runtime");
const Utils_1 = require("../../Utils");
const NginxMapper_1 = require("./NginxMapper");
const logger = runtime_1.Logger.getLogger('metric:NginxRepository');
class NginxRepository {
    getGroupColumns(controller, pod) {
        let groupColumns = ['"namespace", "_field"'];
        if (!Utils_1.Utils.isEmpty(controller))
            groupColumns.push('"controller_name"');
        if (!Utils_1.Utils.isEmpty(pod))
            groupColumns.push('"pod_name"');
        return groupColumns;
    }
    getFilterQuery(client, namespace, s, e, service) {
        let query = `
        from(bucket: "${client.log_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "ingress-nginx" or r["_measurement"] == "ingress-nginx-2xx")
            |> filter(fn: (r) => r["_field"] == "http_referer")`;
        if (!Utils_1.Utils.isEmpty(namespace)) {
            query += `
            |> filter(fn: (r) => r["backend_namespace"] == "${namespace}")`;
        }
        if (!Utils_1.Utils.isEmpty(service)) {
            query += `
            |> filter(fn: (r) => r["service_name"] == "${service}")`;
        }
        return query;
    }
    getStatusCodeAggregate(client, namespace, s, e, u, desc, service) {
        let query = this.getFilterQuery(client, namespace, s, e, service);
        query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: ["status"])  
            |> aggregateWindow(every: ${u} , fn: count, createEmpty: true)
            |> sort(columns: ["_time"], desc: ${desc})
            |> pivot(rowKey: ["_time"], columnKey: ["status"], valueColumn: "_value")
            |> drop(columns: ["_start", "_stop"])`;
        const p = client.collectRows(query, NginxMapper_1.NginxMapper.rowMapper);
        //const p = client.getQueryApi().queryRaw(query);
        return p;
    }
    getStatusCodeAggregateCount(client, namespace, s, e, u, service) {
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
exports.NginxRepository = NginxRepository;
//# sourceMappingURL=NginxRepository.js.map