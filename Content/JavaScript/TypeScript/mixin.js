"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mixin;
const UE = __importStar(require("ue"));
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
//# sourceMappingURL=mixin.js.map