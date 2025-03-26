import { AnyObject, Logger, MetricData, MetricFilter, MetricItemSeries } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
import { TrafficRepository } from './TrafficRepository';
import { Traffic } from './Traffic';

const logger = Logger.getLogger('metric:TrafficService');

export class TrafficService extends InfluxdbService {
  private trafficRepository: TrafficRepository = new TrafficRepository();

  async getNetworkOutUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    return this.getTrafficUsage(env, deploy, options, 'e');
  }

  async getNetworkInUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    return this.getTrafficUsage(env, deploy, options, 'i');
  }

  /**
   * Traffic 사용량 조회 (Namespace, Controller, Pod)
   * @param object
   * @param options
   * @returns
   */
  async getTrafficUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter, gress?: string): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    //count
    const count = await this.trafficRepository.getTrafficUsageCount(client, deploy.namespace, options.from, options.to, unit, gress, deploy.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    //data
    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.trafficRepository.getTrafficUsage(client, deploy.namespace, options.from, options.to, unit, gress, desc, deploy.name);
    }

    return this.toMetricData(deploy, options, total, dataPoints, gress);
  }

  private toMetricData(deploy: AnyObject, options: MetricFilter, total: number, dataPoints: Traffic[], gress?: string): MetricData {
    const dates = [];
    const values = [];

    if (dataPoints != undefined) {
      for (const data of dataPoints) {
        dates.push(data.date);
        if (gress === 'i') {
          values.push(data.ingress);
        } else {
          values.push(data.egress);
        }
      }
    }

    const item: MetricItemSeries = {
      name: deploy.name,
      values: values
    };

    const metricData: MetricData = {
      total: total,
      dates: dates,
      series: [item]
    };

    return metricData;
  }
}
