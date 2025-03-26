import { AnyObject, Logger, MetricData, MetricFilter, MetricItemSeries } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
import { NginxRepository } from './NginxRepository';
import { Nginx } from './Nginx';

const logger = Logger.getLogger('metric:NginxService');

export class NginxService extends InfluxdbService {
  private nginxRepository: NginxRepository = new NginxRepository();

  /**
   * Nginx StatusCode 카운팅 (Namespace, Service)
   * @param object
   * @param options
   * @returns
   */
  async getStatusCodeAggregate(env: AnyObject, service: AnyObject, options: MetricFilter): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    //count
    const count = await this.nginxRepository.getStatusCodeAggregateCount(client, service.namespace, options.from, options.to, unit, service.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    //data
    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.nginxRepository.getStatusCodeAggregate(client, service.namespace, options.from, options.to, unit, desc, service.name);
      logger.info(dataPoints);
    }

    return this.toMetricData(service, options, total, dataPoints);
  }

  private toMetricData(deploy: AnyObject, options: MetricFilter, total: number, dataPoints: Nginx[]): MetricData {
    const dates = [];
    const items: MetricItemSeries[] = [];

    if (dataPoints != undefined) {
      for (const data of dataPoints) {
        dates.push(data.date);

        data.map.forEach((value: number, key: string) => {
          this.toMetricItem(items, key, value);
        });
      }
    }

    const metricData: MetricData = {
      total: total,
      dates: dates,
      series: items
    };

    return metricData;
  }

  private toMetricItem(items: MetricItemSeries[], name: string, value: number) {
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
