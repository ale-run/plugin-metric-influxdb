import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Memory } from './Memory';
export declare class MemoryMapper {
    static rowMapper(values: string[], tableMeta: FluxTableMetaData): Memory;
}
