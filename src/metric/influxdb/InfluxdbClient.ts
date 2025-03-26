import { Logger } from '@ale-run/runtime';
import { FluxTableMetaData, HttpError, InfluxDB, QueryApi } from '@influxdata/influxdb-client';

const logger = Logger.getLogger('metric:InfluxdbClient');

export class InfluxdbClient {
  private influxdb_url = process.env.INFLUX_URL;
  private influxdb_token = process.env.INFLUX_TOKEN;
  private influxdb_org = process.env.INFLUX_ORG;

  readonly api_bucket = 'ctyapidb';
  readonly log_bucket = 'ctylogdb';

  constructor(url: string, token: string, org: string) {
    this.influxdb_url = url;
    this.influxdb_token = token;
    this.influxdb_org = org;
    //logger.info(this.influxdb_url);
  }

  public getQueryApi(): QueryApi {
    const client = new InfluxDB({
      url: this.influxdb_url,
      token: this.influxdb_token,
      timeout: 10000
    });
    const queryApi = client.getQueryApi(this.influxdb_org);
    return queryApi;
  }

  public async collectRows<T>(fluxQuery: string, rowMapper?: (values: string[], tableMeta: FluxTableMetaData) => T | undefined): Promise<Array<T>> {
    logger.info(fluxQuery);

    try {
      const queryApi = this.getQueryApi();
      const data = await queryApi.collectRows(fluxQuery, rowMapper);
      data.forEach((x) => logger.debug(JSON.stringify(x)));
      return data;
    } catch (error: unknown) {
      logger.error(error);
    }
  }
}
