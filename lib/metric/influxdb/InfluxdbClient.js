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
exports.InfluxdbClient = void 0;
const runtime_1 = require("@ale-run/runtime");
const influxdb_client_1 = require("@influxdata/influxdb-client");
const logger = runtime_1.Logger.getLogger('metric:InfluxdbClient');
class InfluxdbClient {
    constructor(url, token, org) {
        this.influxdb_url = process.env.INFLUX_URL;
        this.influxdb_token = process.env.INFLUX_TOKEN;
        this.influxdb_org = process.env.INFLUX_ORG;
        this.api_bucket = 'ctyapidb';
        this.log_bucket = 'ctylogdb';
        this.influxdb_url = url;
        this.influxdb_token = token;
        this.influxdb_org = org;
        //logger.info(this.influxdb_url);
    }
    getQueryApi() {
        const client = new influxdb_client_1.InfluxDB({
            url: this.influxdb_url,
            token: this.influxdb_token,
            timeout: 10000
        });
        const queryApi = client.getQueryApi(this.influxdb_org);
        return queryApi;
    }
    collectRows(fluxQuery, rowMapper) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(fluxQuery);
            try {
                const queryApi = this.getQueryApi();
                const data = yield queryApi.collectRows(fluxQuery, rowMapper);
                data.forEach((x) => logger.debug(JSON.stringify(x)));
                return data;
            }
            catch (error) {
                logger.error(error);
            }
        });
    }
}
exports.InfluxdbClient = InfluxdbClient;
//# sourceMappingURL=InfluxdbClient.js.map