import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Cpu } from './Cpu';
export declare class CpuMapper {
    static rowMapper(values: string[], tableMeta: FluxTableMetaData): Cpu;
}
