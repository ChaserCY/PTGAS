"use strict";
/**
 * ============================================================================
 *  TypeScript ↔ UE 交互示例 · 统一入口
 * ============================================================================
 *
 *  这套示例和 Blueprints/ 目录下的写法**完全不同**：
 *  Blueprints/ 里每个文件都要 @mixin 一个蓝图资产，类的方法名必须对上引擎的
 *  反射调用（K2_ActivateAbility、ReceiveBeginPlay 之类）。
 *
 *  这里**不使用 mixin**，全是普通函数 —— 主动去调用 UE 的 API，
 *  而不是等 UE 来调用我们。这种写法适合：工具脚本、调试命令、系统模块。
 *
 *  【怎么用】
 *  1. 在 MainGame.ts 末尾加两行（注意：加了以后所有地图都会执行）：
 *
 *         import { RunAllExamples } from "./Examples";
 *         RunAllExamples();
 *
 *  2. 或者只想在特定地图测试 —— 用主菜单的 Play 打开你的新地图后，
 *     在编辑器里执行 Output Log 命令，或改成由某个蓝图去调。
 *
 *  【怎么关掉】
 *  把 index.ts 里 RunAllExamples() 中对应模块的调用注释掉即可，每个示例互相独立。
 * ============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunIfInMap = exports.RunAllExamples = exports.Title = exports.COLORS = exports.GetWorld = exports.GetGameInstance = void 0;
const UE = require("ue");
const puerts_1 = require("puerts");
// ---- 各示例模块（顺序即执行顺序）----
const Basics = require("./01_Basics");
const SpawnActor = require("./02_SpawnActor");
const Timers = require("./03_Timers");
const Delegates = require("./04_Delegates");
const Containers = require("./05_Containers");
const LineTrace = require("./06_LineTrace");
const BlueprintLoad = require("./07_BlueprintLoad");
/**
 * 取 GameInstance。
 *
 * 这是 TS 侧拿到 UE 世界的**唯一入口** —— 由 GAS_GameInstance.cpp 里
 * `GameScript->Start(TEXT("bundle"), Arguments)` 的 Arguments 传进来。
 * 名字 "GameInstance" 必须和 C++ 侧 `Arguments.Add({TEXT("GameInstance"), this})`
 * 完全一致，否则这里拿到 null。
 */
function GetGameInstance() {
    return puerts_1.argv.getByName("GameInstance");
}
exports.GetGameInstance = GetGameInstance;
/**
 * 取当前 World（世界）。
 * 几乎所有 GameplayStatics / KismetSystemLibrary 的函数第一个参数都要它。
 */
function GetWorld() {
    const GI = GetGameInstance();
    return GI ? GI.GetWorld() : null;
}
exports.GetWorld = GetWorld;
/**
 * 常用颜色。
 *
 * ⚠️ LinearColor 的静态属性只有这几个：
 *      White / Gray / Black / Transparent / Red / Green / Blue / Yellow
 *    想要 Cyan、橙色、品红这类颜色，得自己 new 一个（RGBA，取值 0~1）。
 *    这就是个典型例子：UE 里没有的属性别硬点，自己构造。
 */
exports.COLORS = {
    Cyan: new UE.LinearColor(0, 1, 1, 1),
    Orange: new UE.LinearColor(1, 0.5, 0, 1),
    Magenta: new UE.LinearColor(1, 0, 1, 1),
    Yellow: UE.LinearColor.Yellow, // 这个引擎自带
};
/**
 * 在屏幕上打一行带编号的标题，方便区分各示例的输出。
 * Key 参数让同名的消息互相覆盖，而不是刷屏堆叠。
 */
function Title(Index, Text) {
    const World = GetWorld();
    if (!World)
        return;
    UE.KismetSystemLibrary.PrintString(World, `[${Index}] ${Text}`, true, // bPrintToScreen 打到屏幕
    true, // bPrintToLog    打到 Output Log
    exports.COLORS.Cyan, 10.0, // 持续 10 秒
    `Example_${Index}` // Key：同 Key 的消息会互相替换
    );
}
exports.Title = Title;
/**
 * 运行全部示例。
 *
 * 建议第一次全跑一遍看输出，之后按需注释掉不需要的模块。
 */
function RunAllExamples() {
    const World = GetWorld();
    // 兜底：没拿到 World 就直接退出，避免后面一堆空指针报错
    if (!World) {
        console.error('[Examples] 拿不到 World，GameInstance 可能未传入。检查 GAS_GameInstance.cpp 的 Start 参数。');
        return;
    }
    console.log('[Examples] ========== 开始执行 TS ↔ UE 交互示例 ==========');
    Basics.Run(World); // 01 基础：拿对象、调函数、出参处理
    SpawnActor.Run(World); // 02 生成/操作/销毁 Actor
    Timers.Run(World); // 03 定时器：UE 定时器 vs JS 定时器
    Delegates.Run(World); // 04 绑定 UE 委托
    Containers.Run(World); // 05 容器：TArray / TMap / 结构体
    LineTrace.Run(World); // 06 射线检测：最实用的调试手段
    BlueprintLoad.Run(World); // 07 类型安全的蓝图加载（替代 UE.Class.Load 字符串路径）
    console.log('[Examples] ========== 示例执行完毕，屏幕左上角查看输出 ==========');
}
exports.RunAllExamples = RunAllExamples;
/**
 * 只在指定地图里运行示例。
 *
 * 入口脚本是跟着 GameInstance 走的，**不分地图**都会执行。
 * 所以想「只在我新建的那张测试图里跑」，用这个函数做一层名字过滤：
 *
 *     import { RunIfInMap } from "./Examples";
 *     RunIfInMap("MyTestMap");
 *
 * 地图名怎么找：编辑器右下角，或者 Content Browser 里对着地图资产看
 * 「资产名」——注意**不带** .umap 后缀，也不带路径。
 */
function RunIfInMap(LevelName) {
    const World = GetWorld();
    if (!World)
        return;
    // bRemovePrefixString = true，去掉引擎内部的前缀（如 UEDPIE_0_）
    const Current = UE.GameplayStatics.GetCurrentLevelName(World, true);
    if (Current !== LevelName) {
        console.log(`[Examples] 当前地图是 "${Current}"，不是 "${LevelName}"，跳过示例`);
        return;
    }
    console.log(`[Examples] 地图匹配 "${LevelName}"，开始执行示例`);
    RunAllExamples();
}
exports.RunIfInMap = RunIfInMap;
// 默认导出，方便 `import Examples from "./Examples"` 这种写法
exports.default = { GetGameInstance, GetWorld, Title, COLORS: exports.COLORS, RunAllExamples, RunIfInMap };
//# sourceMappingURL=index.js.map