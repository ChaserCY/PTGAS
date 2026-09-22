/**
 * ============================================================================
 *  01 · 基础互操作 —— 从 TS 调用 UE
 * ============================================================================
 *
 *  本文件讲四件事：
 *    ① 怎么拿到 UE 对象（World / 玩家 / 控制器）
 *    ② 怎么调用 UE 的函数（静态函数库 / 对象方法）
 *    ③ 怎么读写 UE 对象的属性
 *    ④ 怎么处理「出参」—— 这是 Puerts 最容易翻车的地方
 *
 *  ⚠️ 全程没有 @mixin，都是普通函数主动去调 UE。
 * ============================================================================
 */

import * as UE from 'ue';
import { $ref, $unref, $Ref } from 'puerts';
import { Title } from './index';

export function Run(World: UE.World): void {
    Title(1, '基础互操作开始');

    // ========================================================================
    // ① 拿到 UE 对象
    // ========================================================================

    // GetPlayerController(WorldContextObject, PlayerIndex)
    // 第一个参数叫 WorldContextObject，几乎所有 GameplayStatics 函数都要它。
    // 传 World 或 GameInstance 都行，它们的用途是「让引擎知道去哪个世界找」。
    const PC = UE.GameplayStatics.GetPlayerController(World, 0);

    // GetPlayerCharacter 返回基类 Character，需要自己断言成具体类型
    const Player = UE.GameplayStatics.GetPlayerCharacter(World, 0);

    // ⚠️ 任何 UE 对象都可能是 null —— 空地图里没有 Pawn、没有 Controller 都是正常的。
    //    养成「拿到就判空」的习惯，否则后面一调用就是崩。
    if (!PC || !Player) {
        UE.KismetSystemLibrary.PrintString(World, '当前地图没有玩家，01 示例跳过部分内容', true, true, UE.LinearColor.Yellow, 10, 'Example_1');
        return;
    }

    // ---------- 类型转换 ----------
    // TS 的 as 只是「告诉编译器」，运行时不做检查。
    // 真正安全的是用 UE 的反射判断，例如 Object.IsA(Class)：
    const bIsPawn = Player.IsA(UE.Pawn.StaticClass());
    console.log(`[01] Player 是不是 Pawn 类型？ ${bIsPawn}`);

    // ========================================================================
    // ② 调用 UE 的函数
    // ========================================================================

    // 【静态函数库】形如 UE.XXXLibrary.FunctionName(...)
    const GameTime = UE.KismetSystemLibrary.GetGameTimeInSeconds(World);
    console.log(`[01] 游戏已运行 ${GameTime.toFixed(2)} 秒`);

    // 【对象方法】直接点出来，参数顺序和蓝图节点完全一致
    const PlayerLocation = Player.K2_GetActorLocation();
    console.log(`[01] 玩家坐标 = (${PlayerLocation.X.toFixed(1)}, ${PlayerLocation.Y.toFixed(1)}, ${PlayerLocation.Z.toFixed(1)})`);

    // ========================================================================
    // ③ 读写属性
    // ========================================================================
    // UPROPERTY 暴露出来的字段可以直接当普通 JS 属性读写。
    // 如果属性是 BlueprintReadOnly，TS 侧能读到但改不动（改了不起作用）。

    const PlayerName = Player.GetName();          // GetName() 是 UObject 自带的
    console.log(`[01] 玩家对象名 = ${PlayerName}`);

    // 举一个能写的例子：给玩家挂一个「生命周期」，30 秒后自动销毁
    // ⚠️ 这只是演示，真跑起来会把玩家删掉，所以这里注释掉了：
    // Player.SetLifeSpan(30.0);

    // ========================================================================
    // ④ 出参（Out Param）—— 重点！
    // ========================================================================
    //
    // C++ 里长这样：
    //     void GetActorBounds(AActor* Actor, FVector& Origin, FVector& BoxExtent);
    //
    // 两个引用参数是「出参」，函数会把结果写进去。
    // TS 没有引用传递，所以 Puerts 提供了 $ref / $unref 这一对工具：
    //
    //     $ref(初始值)   →  创建一个「引用盒子」
    //     传给 UE 函数    →  UE 往盒子里写值
    //     $unref(盒子)   →  把值取出来
    //
    // 看不到的坑：不 $ref 直接传普通对象，UE 写进去的东西你是拿不到的。

    const Origin: $Ref<UE.Vector> = $ref(new UE.Vector(0, 0, 0));
    const BoxExtent: $Ref<UE.Vector> = $ref(new UE.Vector(0, 0, 0));

    UE.KismetSystemLibrary.GetActorBounds(Player, Origin, BoxExtent);

    // 用 $unref 取出 UE 填好的值
    const RealOrigin = $unref(Origin);
    const RealExtent = $unref(BoxExtent);
    console.log(`[01] 包围盒中心 = (${RealOrigin.X.toFixed(1)}, ${RealOrigin.Y.toFixed(1)}, ${RealOrigin.Z.toFixed(1)})`);
    console.log(`[01] 包围盒半径 = (${RealExtent.X.toFixed(1)}, ${RealExtent.Y.toFixed(1)}, ${RealExtent.Z.toFixed(1)})`);

    // ---------- 另一种出参：UE 返回 bool 表示「成功与否」 ----------
    // 例如 KismetSystemLibrary.LineTraceSingle 就是
    //   返回 bool + 一个 $Ref<HitResult> 出参 —— 见 06_LineTrace.ts

    // ========================================================================
    // 打印到屏幕
    // ========================================================================
    // PrintString(WorldContext, 文本, 打屏幕, 打日志, 颜色, 时长, Key)
    // Key 相同的新消息会覆盖旧消息，不会刷屏
    UE.KismetSystemLibrary.PrintString(
        World,
        `玩家在 (${PlayerLocation.X.toFixed(0)}, ${PlayerLocation.Y.toFixed(0)}, ${PlayerLocation.Z.toFixed(0)})`,
        true,
        false,                       // 这条不打日志，只上屏
        UE.LinearColor.Green,
        10.0,
        'Example_1_Detail'
    );
}

/*
 * ----------------------------------------------------------------------------
 *  小结 · 调用 UE 的三条铁律
 * ----------------------------------------------------------------------------
 *  1. 拿到对象先判空 —— UE 侧大量 API 会返回 null 而不是抛异常
 *  2. 静态函数看第一个参数是不是 WorldContextObject
 *  3. 遇到 C++ 的 `T&` 出参，就用 $ref 包一层，取值用 $unref
 * ----------------------------------------------------------------------------
 */
