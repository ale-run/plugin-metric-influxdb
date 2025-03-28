"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMapper = void 0;
const Memory_1 = require("./Memory");
const Utils_1 = require("../../Utils");
class MemoryMapper {
    static rowMapper(values, tableMeta) {
        const memory = new Memory_1.Memory();
        memory.date = tableMeta.get(values, '_time');
        memory.name = tableMeta.get(values, 'pod_name');
        if (Utils_1.Utils.isEmpty(memory.name)) {
            memory.name = tableMeta.get(values, 'controller_name');
        }
        if (Utils_1.Utils.isEmpty(memory.name)) {
            memory.name = tableMeta.get(values, 'namespace');
        }
        memory.value = tableMeta.get(values, '_value');
        // memory.usage = tableMeta.get(values, "memory_usage_mib");
        // memory.limit = tableMeta.get(values, "memory_limit_mib");
        return memory;
    }
}
exports.MemoryMapper = MemoryMapper;
//# sourceMappingURL=MemoryMapper.js.map