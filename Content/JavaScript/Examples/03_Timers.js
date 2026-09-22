"use strict";
/**
 * ============================================================================
 *  03 · 定时器 —— UE 定时器 vs JS 定时器
 * ============================================================================
 *
 *  「每隔 0.5 秒执行一次」这种需求，在 Puerts 里有**两条完全不同的路**：
 *
 *    路线 A：UE 定时器（KismetSystemLibrary.K2_SetTimer*）
 *            —— 归引擎管理，Actor 销毁/关卡切换时会自动清理
 *
 *    路线 B：JS 定时器（setInterval / setTimeout）
 *            —— 归 JS 管理，引擎不知道它的存在，必须自己清
 *
 *  本文件两条都演示，并说明什么时候该用哪条。
 * ============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearTimers = exports.Run = void 0;
const UE = require("ue");
const puerts_1 = require("puerts");
const index_1 = require("./index");
// 把 JS 定时器的 id 存在模块级变量里，方便统一清理
// （项目里 BP_Enemy.ts 用的就是这个套路：_rotationIntervalId）
let JsIntervalId = null;
let JsTimeoutId = null;
// UE 定时器的句柄，用来取消
let UeTimerHandle = null;
// 存一下原始回调，释放委托时要用它
let UeTimerCallback = null;
function Run(World) {
    (0, index_1.Title)(3, '定时器示例');
    // ========================================================================
    // 路线 A-1：UE 定时器（委托版）—— 推荐
    // ========================================================================
    //
    // ⚠️ 关键区别，很多人在这里踩坑：
    //
    //    K2_SetTimer(对象, "函数名", ...)     ← 按**名字**查找 UFunction
    //    K2_SetTimerDelegate(委托, ...)       ← 直接给一个委托
    //
    //    纯 TS 写的函数**不是 UFunction**（没有经过 UCLASS/UFUNCTION 反射注册），
    //    所以 K2_SetTimer 找不到它们，会静默失败什么也不发生。
    //    这也是项目里 BP_LaserActor.ts 能用 K2_SetTimer 的原因 —— 它是个
    //    @mixin 过的蓝图类，那些函数在引擎眼里是真实存在的 UFunction。
    //
    //    我们这里不用 mixin，所以**必须走 Delegate 版**。
    UeTimerCallback = () => {
        // 这个箭头函数每 1 秒被引擎调用一次
        const Now = UE.KismetSystemLibrary.GetGameTimeInSeconds(World);
        console.log(`[03][UE定时器] 第 N 次触发，游戏时间 ${Now.toFixed(2)}s`);
    };
    // toManualReleaseDelegate 把普通 JS 函数包装成引擎能识别的委托。
    // 「ManualRelease」的意思是：**生命周期由你负责**，用完必须手动释放，
    // 否则这个委托会一直被 JS 侧引用着，可能造成泄漏。
    const UeDelegate = (0, puerts_1.toManualReleaseDelegate)(UeTimerCallback);
    UeTimerHandle = UE.KismetSystemLibrary.K2_SetTimerDelegate(UeDelegate, 1.0, // 间隔 1 秒
    true, // bLooping = 循环
    0.0, // 首次延迟
    0.0 // 延迟抖动
    );
    console.log('[03] UE 循环定时器已启动（每秒一次）');
    // ========================================================================
    // 路线 A-2：只执行一次的 UE 定时器
    // ========================================================================
    // 把 bLooping 传 false 即可；这里演示 2 秒后自动取消上面那个循环定时器
    const OnceCallback = () => {
        UE.KismetSystemLibrary.K2_ClearTimerHandle(World, UeTimerHandle);
        console.log('[03] 2 秒到，已取消 UE 循环定时器');
        UE.KismetSystemLibrary.PrintString(World, 'UE 定时器已停止', true, false, new UE.LinearColor(1, 0.5, 0, 1), 6.0, 'Example_3');
    };
    const OnceDelegate = (0, puerts_1.toManualReleaseDelegate)(OnceCallback);
    UE.KismetSystemLibrary.K2_SetTimerDelegate(OnceDelegate, 2.0, false);
    // ========================================================================
    // 路线 B：JS 定时器 —— setInterval / setTimeout
    // ========================================================================
    //
    // Puerts 的 JS 运行在游戏主线程上，所以 setInterval 是**能用**的
    // （项目里 BP_Enemy.ts 就用它做敌人血条的朝向更新）。
    //
    // 但它和 UE 定时器有三个本质区别：
    //
    //   ┌──────────────┬─────────────────────┬────────────────────────┐
    //   │              │ UE 定时器            │ JS 定时器               │
    //   ├──────────────┼─────────────────────┼────────────────────────┤
    //   │ 时间基准      │ 游戏时间（可暂停）    │ 真实时间（不暂停）       │
    //   │ 生命周期      │ Actor 销毁自动清理    │ 必须手动 clear          │
    //   │ 关卡切换      │ 自动失效             │ **会继续跑！**           │
    //   └──────────────┴─────────────────────┴────────────────────────┘
    //
    // 所以：游戏逻辑用 UE 定时器；纯工具/调试用途可以图省事用 JS 定时器。
    let JsTickCount = 0;
    JsIntervalId = setInterval(() => {
        JsTickCount++;
        console.log(`[03][JS定时器] 第 ${JsTickCount} 次触发（真实时间，暂停游戏也照跑）`);
        if (JsTickCount >= 3) {
            clearJsTimers(); // 演示完自己收尾
        }
    }, 800);
    JsTimeoutId = setTimeout(() => {
        console.log('[03] JS setTimeout 触发（3 秒后，只跑一次）');
    }, 3000);
    UE.KismetSystemLibrary.PrintString(World, 'UE定时器(1s循环→2s后停) 与 JS定时器(0.8s×3次) 已启动，看 Output Log', true, false, new UE.LinearColor(0, 1, 1, 1), 8.0, 'Example_3');
}
exports.Run = Run;
/**
 * 清理所有 JS 定时器。
 *
 * ⚠️ 这个函数**必须**在合适的时机调用（比如关卡结束时），否则：
 *    - 定时器还在跑 → 回调里访问已经销毁的 UE 对象 → 崩溃
 *    - 切换关卡后旧定时器仍在执行 → 幽灵行为
 *
 * UE 定时器没这个问题，这正是它更适合游戏逻辑的原因。
 */
function ClearTimers(World) {
    clearJsTimers();
    // 清 UE 定时器：如果句柄还有效，取消掉
    if (UeTimerHandle) {
        UE.KismetSystemLibrary.K2_ClearTimerHandle(World, UeTimerHandle);
        UeTimerHandle = null;
    }
    // 释放手动管理的委托，避免泄漏
    if (UeTimerCallback) {
        (0, puerts_1.releaseManualReleaseDelegate)(UeTimerCallback);
        UeTimerCallback = null;
    }
    console.log('[03] 全部定时器已清理');
}
exports.ClearTimers = ClearTimers;
/** 只清 JS 侧的定时器 */
function clearJsTimers() {
    if (JsIntervalId !== null) {
        clearInterval(JsIntervalId);
        JsIntervalId = null;
        console.log('[03] JS setInterval 已清理');
    }
    if (JsTimeoutId !== null) {
        clearTimeout(JsTimeoutId);
        JsTimeoutId = null;
    }
}
/*
 * ----------------------------------------------------------------------------
 *  小结
 * ----------------------------------------------------------------------------
 *  · 纯 TS 函数不是 UFunction → K2_SetTimer("函数名") 无效，必须用 Delegate 版
 *  · toManualReleaseDelegate 造的委托，用完要 releaseManualReleaseDelegate
 *  · 游戏逻辑优先 UE 定时器（跟随游戏时间、自动清理）
 *  · JS 定时器在切关卡后仍会继续跑，务必在适当时机 clearInterval
 * ----------------------------------------------------------------------------
 */
//# sourceMappingURL=03_Timers.js.map