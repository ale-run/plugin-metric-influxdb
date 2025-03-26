import { AnyObject, Logger, MetricData, MetricFilter, MetricItemSeries } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
import { MemoryRepository } from './MemoryRepository';
import { InfluxdbClient } from '../InfluxdbClient';
import { Memory } from './Memory';

const logger = Logger.getLogger('metric:MemoryService');

export class MemoryService extends InfluxdbService {
  private memoryRepository: MemoryRepository = new MemoryRepository();

  /**
   * Memory 사용량
   * @param env
   * @param deploy
   * @param options
   * @returns
   */
  async getMemoryUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    //count
    const count = await this.memoryRepository.getMemoryUsageCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    //data
    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.memoryRepository.getMemoryUsage(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
    }

    return this.toMetricData(deploy, options, total, dataPoints);
  }

  /**
   * Memory Limit
   * @param env
   * @param deploy
   * @param options
   * @returns
   */
  async getMemoryLimit(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    //count
    const count = await this.memoryRepository.getMemoryLimitCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    //data
    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.memoryRepository.getMemoryLimit(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
    }

    return this.toMetricData(deploy, options, total, dataPoints);
  }

  private toMetricData(deploy: AnyObject, options: MetricFilter, total: number, dataPoints: Memory[]): MetricData {
    const dates = [];
    const values = [];

    if (dataPoints != undefined) {
      for (const data of dataPoints) {
        dates.push(data.date);
        values.push(data.value);
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
