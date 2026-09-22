"use strict";
/**
 * ============================================================================
 *  02 · 生成 / 操作 / 销毁 Actor
 * ============================================================================
 *
 *  TS 侧主动往世界里生成物体，是「脚本指挥引擎」最直观的例子。
 *
 *  本文件讲：
 *    ① 怎么拿到一个 UClass（两种方式：引擎自带类 / 按路径加载资产）
 *    ② 怎么生成 Actor（标准两步法，能安全地传初始化参数）
 *    ③ 怎么改位置、旋转、缩放
 *    ④ 怎么销毁（立刻销毁 vs 定时自毁）
 * ============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Run = void 0;
const UE = require("ue");
const puerts_1 = require("puerts");
const index_1 = require("./index");
function Run(World) {
    (0, index_1.Title)(2, 'Actor 生成示例');
    // ========================================================================
    // ① 拿到 UClass
    // ========================================================================
    // 【方式 A】引擎自带的 C++ 类 —— 用 类名.StaticClass()
    // ATargetPoint 是引擎内置的空 Actor，不需要任何资产，拿来做试验最安全
    const TargetPointClass = UE.TargetPoint.StaticClass();
    // 【方式 B】按路径加载蓝图资产 —— 用 UE.Class.Load("路径.资产名_C")
    // 注意结尾的 _C 表示「蓝图生成的类」，漏了就加载不到。
    //   const SomeBPClass = UE.Class.Load("/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C");
    //
    // ⚠️ Load 失败会返回 null（路径写错、资产被删），务必判空
    //   if (!SomeBPClass) { console.error("类加载失败"); return; }
    if (!TargetPointClass) {
        console.error('[02] 拿不到 TargetPoint 类，跳过');
        return;
    }
    // 找一个参考点：玩家当前位置（没有再退回世界原点）
    const Player = UE.GameplayStatics.GetPlayerCharacter(World, 0);
    const BaseLocation = Player ? Player.K2_GetActorLocation() : new UE.Vector(0, 0, 0);
    // ========================================================================
    // ② 生成 Actor —— 标准两步法
    // ========================================================================
    //
    // 为什么不直接一步生成？因为两步法允许你在「生成完成」之前设置属性
    // （比如给一个还没 BeginPlay 的 Actor 赋值），避免了「先生成再改」导致的
    // 一瞬间错误状态。蓝图里的「延迟生成 Actor」节点就是这套。
    //
    //   BeginDeferredActorSpawnFromClass  → 造出来但还没初始化
    //          （中间可以随便改属性）
    //   FinishSpawningActor               → 真正放进世界，触发 BeginPlay
    //
    // 注意两个函数都要传 Transform，且**必须一致**，否则位置会跳。
    // 玩家右前方 300 单位、高 100 的位置
    const SpawnLocation = new UE.Vector(BaseLocation.X + 300, BaseLocation.Y, BaseLocation.Z + 100);
    const SpawnTransform = UE.KismetMathLibrary.MakeTransform(SpawnLocation, new UE.Rotator(0, 0, 0), new UE.Vector(1, 1, 1));
    // 第一步：造
    const Deferred = UE.GameplayStatics.BeginDeferredActorSpawnFromClass(World, // WorldContextObject
    TargetPointClass, // 要生成的类
    SpawnTransform, // 位置/旋转/缩放
    UE.ESpawnActorCollisionHandlingMethod.AlwaysSpawn // 碰撞处理策略
    );
    if (!Deferred) {
        console.error('[02] 生成失败');
        return;
    }
    // ↓↓↓ 中间这一段就是「延迟生成」的价值：Actor 还没进世界，随便改 ↓↓↓
    //     比如设置一些「必须在 BeginPlay 之前赋值」的属性。
    //     注意：SetActorLabel 这类函数是编辑器专用的，打包后会失效，非必要不用。
    // ↑↑↑ 改完再放进去 ↑↑↑
    // 第二步：真正放进世界
    const Spawned = UE.GameplayStatics.FinishSpawningActor(Deferred, SpawnTransform);
    if (!Spawned) {
        console.error('[02] FinishSpawning 失败');
        return;
    }
    console.log(`[02] 生成成功：${Spawned.GetName()}`);
    // ========================================================================
    // ③ 操作 Actor
    // ========================================================================
    // 读位置
    const Loc = Spawned.K2_GetActorLocation();
    console.log(`[02] 生成位置 = (${Loc.X.toFixed(0)}, ${Loc.Y.toFixed(0)}, ${Loc.Z.toFixed(0)})`);
    // 改位置：K2_SetActorLocation(新位置, 是否扫描, 出参HitResult, 是否瞬移)
    //
    // ⚠️ 名字带 K2_ 前缀 —— 这是蓝图暴露版本的命名习惯。
    //    不带前缀的 SetActorLocation 是 C++ 内部函数，TS 里点不出来。
    //    凡是发现某个函数「IDE 里没有」，先试试加 K2_ 前缀。
    //
    // 第三个参数是出参（扫描命中的结果），不关心也得给一个，用 $ref 造个空的接住。
    const SweepHit = (0, puerts_1.$ref)(new UE.HitResult());
    Spawned.K2_SetActorLocation(new UE.Vector(Loc.X, Loc.Y + 200, Loc.Z), false, SweepHit, false);
    // 改旋转：K2_SetActorRotation(新旋转, 是否瞬移)
    Spawned.K2_SetActorRotation(new UE.Rotator(0, 90, 0), false);
    // 缩放：Actor 有 SetActorScale3D
    Spawned.SetActorScale3D(new UE.Vector(2, 2, 2));
    // ========================================================================
    // ④ 销毁
    // ========================================================================
    // 【方式 A】定时自毁 —— 测试场景最推荐，不会在地图里留垃圾
    Spawned.SetLifeSpan(15.0); // 15 秒后自动 Destroy
    // 【方式 B】立刻销毁
    //   Spawned.K2_DestroyActor();
    //
    // 【方式 C】延迟销毁（需要延时又不想用 SetLifeSpan 时）
    //   UE.KismetSystemLibrary.K2_SetTimerDelegate(...) 见 03_Timers.ts
    UE.KismetSystemLibrary.PrintString(World, `生成了 1 个 TargetPoint，15 秒后自动销毁`, true, false, UE.LinearColor.Green, 10.0, 'Example_2');
}
exports.Run = Run;
/*
 * ----------------------------------------------------------------------------
 *  小结
 * ----------------------------------------------------------------------------
 *  · 拿类：引擎类用 UE.XXX.StaticClass()，蓝图用 UE.Class.Load("路径.名字_C")
 *  · 生成：BeginDeferredActorSpawnFromClass → (改属性) → FinishSpawningActor
 *  · 两个 Transform 必须传同一个，否则位置会跳
 *  · 测试用的 Actor 记得 SetLifeSpan，不然地图里会越堆越多
 * ----------------------------------------------------------------------------
 */
//# sourceMappingURL=02_SpawnActor.js.map