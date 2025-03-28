import { FluxTableMetaData, QueryApi } from '@influxdata/influxdb-client';
export declare class InfluxdbClient {
    private influxdb_url;
    private influxdb_token;
    private influxdb_org;
    readonly api_bucket = "ctyapidb";
    readonly log_bucket = "ctylogdb";
    constructor(url: string, token: string, org: string);
    getQueryApi(): QueryApi;
    collectRows<T>(fluxQuery: string, rowMapper?: (values: string[], tableMeta: FluxTableMetaData) => T | undefined): Promise<Array<T>>;
}
