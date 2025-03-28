"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxService = void 0;
const runtime_1 = require("@ale-run/runtime");
const InfluxdbService_1 = require("../InfluxdbService");
const NginxRepository_1 = require("./NginxRepository");
const logger = runtime_1.Logger.getLogger('metric:NginxService');
class NginxService extends InfluxdbService_1.InfluxdbService {
    constructor() {
        super(...arguments);
        this.nginxRepository = new NginxRepository_1.NginxRepository();
    }
    /**
     * Nginx StatusCode 카운팅 (Namespace, Service)
     * @param object
     * @param options
     * @returns
     */
    getStatusCodeAggregate(env, service, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getInfluxdbClient(env);
            const unit = this.getInterval(options.interval);
            const desc = false; //true 내림차순, false 오름차순 정렬
            //count
            const count = yield this.nginxRepository.getStatusCodeAggregateCount(client, service.namespace, options.from, options.to, unit, service.name);
            const total = count != null && count.length > 0 ? Number(count[0]) : 0;
            //data
            let dataPoints = undefined;
            if (total > 0) {
                dataPoints = yield this.nginxRepository.getStatusCodeAggregate(client, service.namespace, options.from, options.to, unit, desc, service.name);
                logger.info(dataPoints);
            }
            return this.toMetricData(service, options, total, dataPoints);
        });
    }
    toMetricData(deploy, options, total, dataPoints) {
        const dates = [];
        const items = [];
        if (dataPoints != undefined) {
            for (const data of dataPoints) {
                dates.push(data.date);
                data.map.forEach((value, key) => {
                    this.toMetricItem(items, key, value);
                });
            }
        }
        const metricData = {
            total: total,
            dates: dates,
            series: items
        };
        return metricData;
    }
    toMetricItem(items, name, value) {
        for (const item of items) {
            if (name === item.name) {
                item.values.push(value);
                return;
            }
        }
        const newItem = {
            name: name,
            values: [value]
        };
        items.push(newItem);
        return;
    }
}
exports.NginxService = NginxService;
//# sourceMappingURL=NginxService.js.map