/**
 * ============================================================================
 *  06 · 射线检测（LineTrace）—— 最实用的调试手段
 * ============================================================================
 *
 *  「从 A 点朝 B 点打一条线，看看撞到了什么」是游戏开发里最高频的操作：
 *  瞄准、拾取、寻路探地、技能选目标……底层都是它。
 *
 *  本文件讲：
 *    ① 怎么取到相机的朝向（射线的起点和方向）
 *    ② LineTraceSingle 的完整参数（这是本文件的核心）
 *    ③ 怎么从出参 HitResult 里读出结果
 *    ④ 两个实用场景：前方检测 + 向下探地
 * ============================================================================
 */

import * as UE from 'ue';
import { $ref, $unref, $Ref } from 'puerts';
import { Title } from './index';

export function Run(World: UE.World): void {
    Title(6, '射线检测示例');

    // ========================================================================
    // ① 取射线起点和方向
    // ========================================================================

    const CamMgr = UE.GameplayStatics.GetPlayerCameraManager(World, 0);
    if (!CamMgr) {
        console.error('[06] 没有相机管理器，当前地图可能没有玩家');
        return;
    }

    const Start = CamMgr.K2_GetActorLocation();        // 射线起点 = 相机位置
    const CamRot = CamMgr.K2_GetActorRotation();       // 相机朝向

    // 把朝向转成前向量。Rotator → Vector 用 KismetMathLibrary.GetForwardVector
    const Forward = UE.KismetMathLibrary.GetForwardVector(CamRot);

    console.log(`[06] 相机位置 = (${Start.X.toFixed(0)}, ${Start.Y.toFixed(0)}, ${Start.Z.toFixed(0)})`);

    // ========================================================================
    // ② 前方 3000 单位打一条射线
    // ========================================================================

    // 手动算终点，避免依赖更多 API 名字
    const TraceLength = 3000;
    const End = new UE.Vector(
        Start.X + Forward.X * TraceLength,
        Start.Y + Forward.Y * TraceLength,
        Start.Z + Forward.Z * TraceLength
    );

    // ★ 核心：LineTraceSingle
    //
    //   (WorldContextObject, Start, End, TraceChannel, bTraceComplex,
    //    ActorsToIgnore, DrawDebugType, OutHit, bIgnoreSelf,
    //    TraceColor, TraceHitColor, DrawTime) : boolean
    //
    // 两个要点：
    //   · 返回值 bool 表示「有没有撞到」
    //   · 撞到了什么，全在 OutHit 这个**出参**里 —— 要用 $ref 接住
    //
    //   TraceChannel 用 ETraceTypeQuery 枚举。
    //   TraceTypeQuery1 默认对应 Visibility 通道（能挡住视线的物体）。
    //   要打别的通道，用 KismetSystemLibrary.ConvertToTraceType(ECollisionChannel.XXX)

    const OutHit: $Ref<UE.HitResult> = $ref(new UE.HitResult());

    const bHit = UE.KismetSystemLibrary.LineTraceSingle(
        World,
        Start,
        End,
        UE.ETraceTypeQuery.TraceTypeQuery1,          // 通道
        false,                                        // bTraceComplex：是否精确到三角形（开销大，一般 false）
        UE.NewArray(UE.Actor),                        // ActorsToIgnore：忽略列表，这里给空数组
        UE.EDrawDebugTrace.ForDuration,               // 在场景里画出这条线
        OutHit,                                       // ← 出参，结果写进这里
        true,                                         // bIgnoreSelf：忽略自己
        UE.LinearColor.Red,                           // 没撞到时线的颜色
        UE.LinearColor.Green,                         // 撞到时线的颜色
        5.0                                           // 线显示 5 秒
    );

    // 用 $unref 把结果取出来
    const Hit = $unref(OutHit);

    // ========================================================================
    // ③ 解析命中结果
    // ========================================================================

    if (bHit) {
        // 撞到了什么 Actor —— 用 GetActor() 拿（FHitResult 的 Actor 字段是私有的）
        const HitActor = Hit.GetActor();
        const HitComponent = Hit.Component;   // 撞到的是哪个组件

        console.log('[06] ===== 命中！ =====');
        console.log(`[06]   命中 Actor   = ${HitActor ? HitActor.GetName() : '(无效)'}`);
        console.log(`[06]   命中类       = ${HitActor ? HitActor.GetClass().GetName() : '(未知)'}`);
        console.log(`[06]   命中组件     = ${HitComponent ? HitComponent.GetName() : '(未知)'}`);
        console.log(`[06]   命中点       = (${Hit.Location.X.toFixed(1)}, ${Hit.Location.Y.toFixed(1)}, ${Hit.Location.Z.toFixed(1)})`);
        console.log(`[06]   表面法线     = (${Hit.Normal.X.toFixed(2)}, ${Hit.Normal.Y.toFixed(2)}, ${Hit.Normal.Z.toFixed(2)})`);
        console.log(`[06]   距离         = ${Hit.Distance.toFixed(1)}`);
        console.log(`[06]   穿透深度     = ${Hit.PenetrationDepth.toFixed(2)}`);
        console.log(`[06]   骨骼名       = ${Hit.BoneName}`);

        UE.KismetSystemLibrary.PrintString(
            World,
            `命中：${HitActor ? HitActor.GetName() : '未知'}，距离 ${Hit.Distance.toFixed(0)}`,
            true, false, UE.LinearColor.Green, 8.0, 'Example_6'
        );
    } else {
        console.log('[06] 前方 3000 单位内没有撞到任何东西');
        UE.KismetSystemLibrary.PrintString(
            World, '前方没有命中任何物体', true, false, UE.LinearColor.Red, 8.0, 'Example_6'
        );
    }

    // ========================================================================
    // ④ 实用场景：从玩家位置向下打，找地面
    // ========================================================================
    //
    // 这个模式在做「落点预览」「技能范围指示」时天天用：
    // 从角色脚下往下打，命中点就是地面坐标。

    const Player = UE.GameplayStatics.GetPlayerCharacter(World, 0);
    if (Player) {
        const PlayerLoc = Player.K2_GetActorLocation();
        const DownStart = new UE.Vector(PlayerLoc.X, PlayerLoc.Y, PlayerLoc.Z + 100);   // 稍微抬高一点，避免从脚底开始
        const DownEnd = new UE.Vector(PlayerLoc.X, PlayerLoc.Y, PlayerLoc.Z - 1000);    // 往下 1000 单位

        const GroundHit: $Ref<UE.HitResult> = $ref(new UE.HitResult());

        const bGroundHit = UE.KismetSystemLibrary.LineTraceSingle(
            World, DownStart, DownEnd,
            UE.ETraceTypeQuery.TraceTypeQuery1,
            false,
            UE.NewArray(UE.Actor),
            UE.EDrawDebugTrace.None,      // 这条不画线，免得场景太乱
            GroundHit,
            true
        );

        if (bGroundHit) {
            const G = $unref(GroundHit);
            console.log(`[06] 脚下地面高度 = ${G.Location.Z.toFixed(1)}`);

            // 实际用途：把地面坐标算出来，就能在这里放技能指示器 / 生成特效
            const GroundPoint = new UE.Vector(G.Location.X, G.Location.Y, G.Location.Z);
            console.log(`[06] 地面落点 = (${GroundPoint.X.toFixed(0)}, ${GroundPoint.Y.toFixed(0)}, ${GroundPoint.Z.toFixed(0)})`);

            // 在落点画个球，直观确认位置对不对
            UE.KismetSystemLibrary.DrawDebugSphere(
                World,
                GroundPoint,
                50,                       // 半径
                12,                       // 分段数
                UE.LinearColor.Yellow,
                5.0,
                5.0                       // 线宽
            );
        } else {
            console.log('[06] 脚下 1000 单位内没有地面');
        }
    }
}

/*
 * ----------------------------------------------------------------------------
 *  小结
 * ----------------------------------------------------------------------------
 *  · LineTraceSingle 的返回值是「有没有撞到」，撞到什么在 $Ref<HitResult> 出参里
 *  · 出参三部曲：$ref(new UE.HitResult()) → 传进去 → $unref() 取出来
 *  · HitResult 常用字段：Location / Normal / Distance / GetActor() / Component
 *  · TraceTypeQuery1 默认是 Visibility 通道；要打自定义通道用 ConvertToTraceType
 *  · DrawDebugType 传 ForDuration 可以在场景里看到射线，调位置时非常有用
 * ----------------------------------------------------------------------------
 */
