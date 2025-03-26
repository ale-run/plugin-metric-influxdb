import { AnyObject, Logger, MetricData, MetricFilter, MetricItemSeries } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
import { CpuRepository } from './CpuRepository';
import { InfluxdbClient } from '../InfluxdbClient';
import { Cpu } from './Cpu';

const logger = Logger.getLogger('metric:CpuService');

export class CpuService extends InfluxdbService {
  private cpuRepository: CpuRepository = new CpuRepository();

  /**
   * CPU 사용량 조회
   * @param object
   * @param options
   * @returns
   */
  async getCpuUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    //count
    const count = await this.cpuRepository.getCpuUsageCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    //data
    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.cpuRepository.getCpuUsage(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
    }

    return this.toMetricData(deploy, options, total, dataPoints);
  }

  /**
   * CPU Limit
   * @param env
   * @param deploy
   * @param options
   * @returns
   */
  async getCpuLimit(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData> {
    const client = this.getInfluxdbClient(env);
    const unit = this.getInterval(options.interval);
    const desc = false; //true 내림차순, false 오름차순 정렬

    const count = await this.cpuRepository.getCpuLimitCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
    const total = count != null && count.length > 0 ? Number(count[0]) : 0;

    let dataPoints = undefined;
    if (total > 0) {
      dataPoints = await this.cpuRepository.getCpuLimit(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
    }

    return this.toMetricData(deploy, options, total, dataPoints);
  }

  private toMetricData(deploy: AnyObject, options: MetricFilter, total: number, dataPoints: Cpu[]): MetricData {
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
