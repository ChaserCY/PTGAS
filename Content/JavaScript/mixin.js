"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UE = require("ue");
const puerts_1 = require("puerts");
/**
 创建一个类装饰器，用于将蓝图类混入目标TypeScript类
 @param blueprintPath - 蓝图资源路径，格式为"/Game/Name.Name_C"
 @param objectTakeByNative - 是否由原生端持有对象所有权，默认为true。 控制对象生命周期归属：true表示由原生层管理对象销毁，false表示由脚本层管理对象销毁
 @template T - 被混入的蓝图类类型，需继承UE引擎对象
 @returns - 类装饰器函数，接受需要混入蓝图功能的目标类
 */
function mixin(blueprintPath, objectTakeByNative = true) {
    /**
     * 类装饰器函数
     * @param target 被装饰类的构造函数，要求：
     *   - 必须继承自UE.Object
     *   - 必须合并蓝图基类T的实例特性
     * @template U 被装饰类的实例类型，需继承UE引擎对象
     */
    return function (target) {
        // 加载并转换蓝图类为可用的JavaScript类
        const UClass = UE.Class.Load(blueprintPath);
        const JsClass = puerts_1.blueprint.tojs(UClass);
        // 执行蓝图混入操作，合并蓝图功能到目标类
        return puerts_1.blueprint.mixin(JsClass, target, { objectTakeByNative });
    };
}
exports.default = mixin;
//# sourceMappingURL=mixin.js.map