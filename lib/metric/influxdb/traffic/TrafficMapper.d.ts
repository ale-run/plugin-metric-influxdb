import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Traffic } from './Traffic';
export declare class TrafficMapper {
    static rowMapper(values: string[], tableMeta: FluxTableMetaData): Traffic;
}
