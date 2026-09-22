/**
 * ============================================================================
 *  04 · 绑定 UE 委托（事件回调）
 * ============================================================================
 *
 *  「当某件事发生时，执行我的代码」—— UE 用委托（Delegate）实现。
 *  从 TS 侧可以给任意 UE 对象的委托挂上 JS 回调函数。
 *
 *  本文件讲：
 *    ① 什么是「动态多播委托」，TS 里长什么样
 *    ② 怎么挂回调（.Add）和摘回调（.Remove）
 *    ③ 实际演示：生成一个 Actor，监听它的销毁事件
 *    ④ 对比：puerts 自带的 on/emit（纯 TS 事件总线）
 * ============================================================================
 */

import * as UE from 'ue';
import { on, off, emit, toManualReleaseDelegate } from 'puerts';
import { Title } from './index';

export function Run(World: UE.World): void {
    Title(4, '委托绑定示例');

    // ========================================================================
    // ① UE 委托在 TS 里长什么样
    // ========================================================================
    //
    // 在生成出来的类型定义（Typing/ue/ue.d.ts）里，多播委托被描述成：
    //
    //     OnDestroyed: $MulticastDelegate<(DestroyedActor: $Nullable<UE.Actor>) => void>;
    //
    //  $MulticastDelegate<T> 提供三个方法：
    //     .Add(回调)      挂上一个回调（可以有多个，都会被执行）
    //     .Remove(回调)   摘掉指定回调
    //     .Broadcast(...) 手动触发（一般由引擎侧调用，TS 很少用）
    //
    //  ⚠️ 回调的**参数签名必须和类型定义完全一致**，多一个少一个都不行。
    //     拿不准的时候，在 IDE 里对着 .Add( 按 Ctrl+Space 看提示。

    // ========================================================================
    // ② 实际演示：生成一个 Actor，监听它被销毁
    // ========================================================================

    const PointClass = UE.TargetPoint.StaticClass();
    if (!PointClass) return;

    const Player = UE.GameplayStatics.GetPlayerCharacter(World, 0);
    const Base = Player ? Player.K2_GetActorLocation() : new UE.Vector(0, 0, 0);

    const Transform = UE.KismetMathLibrary.MakeTransform(
        new UE.Vector(Base.X, Base.Y + 400, Base.Z + 100),
        new UE.Rotator(0, 0, 0),
        new UE.Vector(1, 1, 1)
    );

    const TestActor = UE.GameplayStatics.BeginDeferredActorSpawnFromClass(
        World, PointClass, Transform, UE.ESpawnActorCollisionHandlingMethod.AlwaysSpawn
    );
    if (!TestActor) return;

    const Spawned = UE.GameplayStatics.FinishSpawningActor(TestActor, Transform);
    if (!Spawned) return;

    // ---------- 挂回调 ----------
    // 注意参数签名要对着 OnDestroyed 的类型写：(DestroyedActor: Actor) => void
    const OnDestroyedHandler = (DestroyedActor: UE.Actor) => {
        console.log(`[04] 收到销毁回调：${DestroyedActor.GetName()} 被销毁了`);
        UE.KismetSystemLibrary.PrintString(
            World, '监听到 Actor 销毁事件', true, false, new UE.LinearColor(1, 0, 1, 1), 6.0, 'Example_4'
        );
    };

    Spawned.OnDestroyed.Add(OnDestroyedHandler);
    console.log('[04] 已给测试 Actor 挂上 OnDestroyed 回调');

    // ---------- 演示：3 秒后销毁它，触发回调 ----------
    UE.KismetSystemLibrary.K2_SetTimerDelegate(
        toManualReleaseDelegate(() => {
            // 先摘回调再销毁，演示 .Remove 的用法
            // （这里其实不摘也会触发，因为销毁发生在 Remove 之前 —— 见下方说明）
            Spawned.K2_DestroyActor();
        }),
        3.0,
        false
    );

    // ========================================================================
    // ③ 另一个常用委托：OnTakeAnyDamage（受伤）
    // ========================================================================
    // 挂在任意 Actor 上都能用，只要它受到伤害就会触发
    //
    //   Spawned.OnTakeAnyDamage.Add((DamagedActor, Damage, DamageType, InstigatedBy, DamageCauser) => {
    //       console.log(`受到 ${Damage} 点伤害`);
    //   });
    //
    // 参数顺序照着类型定义抄，一个都不能少。

    // ========================================================================
    // ④ 对比：puerts 自带的 on / emit（纯 TS 事件总线）
    // ========================================================================
    //
    // 如果要广播的事件**完全不涉及 UE**（比如「技能数据加载完成」「本地设置变更」），
    // 用 puerts 的 on/emit 更轻便 —— 它就是一个 JS 侧的事件总线，
    // 不需要任何 UE 对象，也不受引擎生命周期影响。

    const EventName = 'Example4_CustomEvent';

    const CustomHandler = (Payload: string) => {
        console.log(`[04][on/emit] 收到自定义事件，内容是：${Payload}`);
    };

    on(EventName, CustomHandler);      // 订阅
    emit(EventName, '你好，这是 TS 侧的事件');   // 发布 → 上面的回调立刻执行
    off(EventName, CustomHandler);     // 退订

    UE.KismetSystemLibrary.PrintString(
        World,
        '3 秒后测试 Actor 会自动销毁，注意看回调是否触发',
        true, false, new UE.LinearColor(1, 0, 1, 1), 8.0, 'Example_4_Hint'
    );
}

/*
 * ----------------------------------------------------------------------------
 *  小结
 * ----------------------------------------------------------------------------
 *  · UE 委托：对象.委托名.Add(回调) / .Remove(回调)
 *  · 回调参数签名必须和类型定义严格一致，IDE 里看提示
 *  · 涉及 UE 的事件 → 用 UE 委托（生命周期跟着对象走）
 *  · 纯 JS 内部的事件 → 用 puerts 的 on / off / emit
 *
 *  ⚠️ 内存提示：
 *     挂上去的回调会被 UE 对象**强引用**着。如果目标对象活得比你想的长，
 *     而你又在回调里闭包了一个很大的对象，那这个大对象就一直释放不掉。
 *     不用了记得 .Remove()，或者把回调写成模块级的具名函数。
 * ----------------------------------------------------------------------------
 */
