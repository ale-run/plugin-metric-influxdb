import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Nginx } from './Nginx';
export declare class NginxMapper {
    static rowMapper(values: string[], tableMeta: FluxTableMetaData): Nginx;
}
