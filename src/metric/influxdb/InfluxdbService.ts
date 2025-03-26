import { AnyObject } from '@ale-run/runtime';
import { InfluxdbClient } from './InfluxdbClient';

export class InfluxdbService {
  getInfluxdbClient(env: AnyObject) {
    const url = env['INFLUX_URL'];
    const token = env['INFLUX_TOKEN'];
    const org = env['INFLUX_ORG'];

    return new InfluxdbClient(url, token, org);
  }

  getInterval(u: string) {
    if (u === 'm') {
      return '10m';
    } else if (u === 'h') {
      return '1h';
    } else if (u === 'd') {
      return '1d';
    } else {
      return u;
    }
  }
}
