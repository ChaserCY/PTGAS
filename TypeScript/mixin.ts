import * as UE from "ue";
import {blueprint} from "puerts";

//储存需要mixin的蓝图类
export const BlueprintClasses: Map<string,UE.Class> = new Map<string,UE.Class>();



/**
 创建一个类装饰器，用于将蓝图类或原生C++类混入目标TypeScript类
 @param pathOrClass - 蓝图资源路径(如"/Game/Name.Name_C") 或 原生C++类路径(如"/Script/ModuleName.ClassName")
 @param objectTakeByNative - 是否由原生端持有对象所有权，默认为true。 控制对象生命周期归属：true表示由原生层管理对象销毁，false表示由脚本层管理对象销毁
 @returns - 类装饰器函数，接受需要混入蓝图功能的目标类
 */
export default function mixin(pathOrClass: string, objectTakeByNative = true) {

    // 优先从缓存取，避免重复加载
    let UClass = BlueprintClasses.get(pathOrClass);
    if (!UClass) {
        UClass = UE.Class.Load(pathOrClass);
        if (UClass) {
            BlueprintClasses.set(pathOrClass, UClass);
        } else {
            throw new Error(`Failed to load Class at path:${pathOrClass}`);
        }
    }
        
    /*
     * 类装饰器函数
     * @param target - 被装饰的构造函数
     * @returns 混入后的构造函数
     */
    return function (target: new (...args: any[]) => UE.Object) {
        // 加载并转换蓝图类或原生C++类为可用的JavaScript类
        
        const JsClass = blueprint.tojs(UClass);
        // 执行混入操作，合并原生功能到目标TypeScript类
        // mixin 在运行时注入原型方法，TS 静态期无法感知，需要类型断言
        return blueprint.mixin(JsClass, target, {objectTakeByNative}) as any;
    };
}
