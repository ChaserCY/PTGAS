/**
 * ============================================================================
 *  07 · 类型安全的蓝图加载 —— blueprint.load
 * ============================================================================
 *
 *  你项目里所有蓝图 TS 都是这个写法加载类的：
 *
 *      UE.Class.Load("/Game/BluePrints/Ability/_05FireBlast/GE_FireBlast_Damage.GE_FireBlast_Damage_C")
 *                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                        纯字符串，写错一个字要到**运行时**才发现，IDE 也没有补全
 *
 *  本文件演示 Puerts 官方 demo 推荐的替代方案 —— 用 ue_bp.d.ts 里已经生成好的
 *  类型声明来引用，路径写错**编译期就报错**，而且有完整补全和类型推断。
 *
 *  参考：https://github.com/chexiongsheng/puerts_unreal_demo
 *        TypeScript/QuickStart.ts（第 132-160 行）
 *        TypeScript/UsingMakeUClass.ts
 * ============================================================================
 */

import * as UE from 'ue';
import { blueprint } from 'puerts';
import { Title } from './index';

export function Run(World: UE.World): void {
    Title(7, '类型安全的蓝图加载');

    // ========================================================================
    // ① 两种写法的对比
    // ========================================================================
    //
    // 【老写法】字符串路径
    //     const cls = UE.Class.Load("/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C");
    //
    //   问题有三个：
    //     · 路径拼错 / 资产改名 → 运行时才返回 null，静默失败
    //     · 返回类型是 UE.Class，拿不到蓝图里的任何成员信息
    //     · 没有 IDE 补全
    //
    // 【新写法】类型安全引用
    //   路径来自 Typing/ue/ue_bp.d.ts —— Puerts 的 DeclarationGenerator 自动生成的。
    //   访问 UE.Game.<路径>.<类名>_C 时，运行时是个惰性 Proxy，会去 Object.Load。
    //
    //   ⚠️ 但光访问还不够：此时拿到的是个「命名空间节点」，不是可用的 JS 类。
    //      必须用 blueprint.load() 把它转成真正的类（才会带上 StaticClass() 等方法）。

    blueprint.load(UE.Game.BluePrints.Ability._03Laser.BP_LaserActor.BP_LaserActor_C);
    const BP_LaserActor_C = UE.Game.BluePrints.Ability._03Laser.BP_LaserActor.BP_LaserActor_C;

    // 现在它是个真正的类了
    const LaserClass: UE.Class = BP_LaserActor_C.StaticClass();
    console.log(`[07] 加载成功，类名 = ${LaserClass.GetName()}`);

    // ========================================================================
    // ② 加载 GameplayEffect 类（对应你技能代码里的常见需求）
    // ========================================================================
    //
    // 你项目里 GA_FireBlast.ts 是这么写的：
    //     const FireBlast_Damage = UE.Class.Load("/Game/.../GE_FireBlast_Damage.GE_FireBlast_Damage_C");
    //
    // 换成类型安全写法：

    blueprint.load(UE.Game.BluePrints.Ability._05FireBlast.GE_FireBlast_Damage.GE_FireBlast_Damage_C);
    const GE_FireBlast_Damage_C = UE.Game.BluePrints.Ability._05FireBlast.GE_FireBlast_Damage.GE_FireBlast_Damage_C;
    const DamageEffectClass: UE.Class = GE_FireBlast_Damage_C.StaticClass();

    console.log(`[07] GameplayEffect 类 = ${DamageEffectClass.GetName()}`);
    // 这个 Class 可以直接喂给 GAS 的 API，比如：
    //   UE.AbilitySystemBlueprintLibrary.BP_ApplyGameplayEffectToTarget(TargetData, DamageEffectClass, ...)

    // ========================================================================
    // ③ 生成实例 —— 这里能看出类型安全的价值
    // ========================================================================

    const Player = UE.GameplayStatics.GetPlayerCharacter(World, 0);
    const Base = Player ? Player.K2_GetActorLocation() : new UE.Vector(0, 0, 0);

    const Transform = UE.KismetMathLibrary.MakeTransform(
        new UE.Vector(Base.X + 250, Base.Y + 250, Base.Z + 150),
        new UE.Rotator(0, 0, 0),
        new UE.Vector(1, 1, 1)
    );

    const Deferred = UE.GameplayStatics.BeginDeferredActorSpawnFromClass(
        World, LaserClass, Transform, UE.ESpawnActorCollisionHandlingMethod.AlwaysSpawn
    );

    if (!Deferred) {
        console.error('[07] 生成失败');
        return;
    }

    // ★ 关键：as 到具体类型后，蓝图里定义的组件和变量**全都能点出来**
    //
    //   ue_bp.d.ts 里 BP_LaserActor_C 的声明是这样的：
    //       class BP_LaserActor_C extends UE.Actor {
    //           EndPoint: UE.SphereComponent;
    //           SpringArm: UE.SpringArmComponent;
    //           SkeletalMesh: UE.SkeletalMeshComponent;
    //           HitActor: TArray<UE.Actor>;
    //           LaserDamage() : void;
    //       }
    //
    //   这些是**美术/策划在编辑器里连出来的**东西，TS 这边有完整类型。
    //   用 UE.Class.Load 的话，这些信息一个都拿不到。
    const Laser = UE.GameplayStatics.FinishSpawningActor(Deferred, Transform) as
        UE.Game.BluePrints.Ability._03Laser.BP_LaserActor.BP_LaserActor_C;

    if (!Laser) {
        console.error('[07] FinishSpawning 失败');
        return;
    }

    console.log(`[07] 生成成功：${Laser.GetName()}`);

    // ---------- 读蓝图组件（全部有类型）----------
    console.log(`[07]   EndPoint 组件   = ${Laser.EndPoint ? Laser.EndPoint.GetName() : '(空)'}`);
    console.log(`[07]   SpringArm 组件  = ${Laser.SpringArm ? Laser.SpringArm.GetName() : '(空)'}`);
    console.log(`[07]   SkeletalMesh   = ${Laser.SkeletalMesh ? Laser.SkeletalMesh.GetName() : '(空)'}`);

    // ---------- 读蓝图数组变量 ----------
    // HitActor 是蓝图里的 TArray<Actor>，TS 侧就是一个标准 TArray，方法齐全
    console.log(`[07]   HitActor 数组长度 = ${Laser.HitActor.Num()}`);
    for (const A of Laser.HitActor) {
        console.log(`[07]     - ${A.GetName()}`);
    }

    // ---------- 改蓝图组件的属性 ----------
    // 比如把检测球半径放大（SphereComponent 有 SetSphereRadius）
    if (Laser.EndPoint) {
        Laser.EndPoint.SetSphereRadius(120, true);
        console.log(`[07]   已把 EndPoint 半径改为 ${Laser.EndPoint.GetScaledSphereRadius().toFixed(0)}`);
    }

    // 测试完让它自己消失，别在地图里留垃圾
    Laser.SetLifeSpan(10.0);

    // ========================================================================
    // ④ 用完卸载 —— 省内存
    // ========================================================================
    //
    // blueprint.unload 会把类引用还原成「命名空间节点」，允许 UE 回收它。
    //
    // ⚠️ 时机很重要（官方 demo 的原话）：
    //    「TestBlueprint 是根据 ucls 生成的类，两者需要生命周期保持同步，
    //      慎防只拿着 TestBlueprint 用，ucls 释放了，然后进而这个蓝图被 UE 给 GC 了」
    //
    //    通俗说：**只要你还持有这个类的实例（或还想再生成），就别 unload。**
    //    这里我已经生成完并让它自毁了，所以可以卸。

    blueprint.unload(BP_LaserActor_C);
    blueprint.unload(GE_FireBlast_Damage_C);
    console.log('[07] 已卸载类引用');

    // ========================================================================
    // ⑤ 蓝图结构体 / 枚举
    // ========================================================================
    //
    // 结构体：load 之后用 new 构造（注意不是 UE.NewStruct）
    //   blueprint.load(UE.Game.BluePrints.SomeFolder.TestStruct.TestStruct);
    //   const TestStruct = UE.Game.BluePrints.SomeFolder.TestStruct.TestStruct;
    //   const inst = new TestStruct();
    //   inst.age = 10;
    //
    // 枚举：**不需要 load**，访问时会自动加载（见 uelazyload.js 里 TENUM 分支）
    //   console.log(UE.Game.BluePrints.SomeFolder.TestEnum.TestEnum.Blue);

    UE.KismetSystemLibrary.PrintString(
        World,
        '类型安全加载完成，详见 Output Log',
        true, true, new UE.LinearColor(0, 1, 1, 1), 8.0, 'Example_7'
    );
}

/*
 * ----------------------------------------------------------------------------
 *  小结 · 什么时候用哪个
 * ----------------------------------------------------------------------------
 *
 *  ┌────────────────────────────┬──────────────────────────────────────────┐
 *  │ UE.Class.Load("字符串路径") │ 路径是动态拼出来的（配置表、循环变量）    │
 *  │                            │ 或者资产在别的项目/插件里，没有类型声明   │
 *  ├────────────────────────────┼──────────────────────────────────────────┤
 *  │ blueprint.load + UE.Game.* │ 路径写死的**蓝图类**资产                 │
 *  │                            │ 想要补全、想访问蓝图成员、想编译期查错     │
 *  └────────────────────────────┴──────────────────────────────────────────┘
 *
 *  ⚠️⚠️ 关键限制：ue_bp.d.ts 里**只有蓝图类**（继承自 UBlueprint 的资产）。
 *
 *      实测你项目的 ue_bp.d.ts：79 个 class 里 68 个带 _C 后缀。
 *      在这些的 →  能干！  GA_Melee_C / GE_Melee_Damage_C / BP_LaserActor_C
 *      不在的    →  干不了  MA_Melee(动画蒙太奇) / IA_Melee(输入动作)
 *                            P_HealthRegen(粒子) / BT_Tree(行为树) / IMC_Default
 *
 *      原因：这些是**普通资产**，没有「生成的类」，自然也没有 _C 声明。
 *      但它们本来就没那么痛 —— UE.AnimMontage.Load() 的**返回类型**已经是
 *      UE.AnimMontage 了，只是路径字符串没被编译期检查而已。
 *
 *      真正值得迁移的是 UE.Class.Load()：它返回的是裸的 UE.Class，
 *      拿不到任何成员信息。
 *
 *  ⚠️ 迁移前必须确认：ue_bp.d.ts 是最新的。
 *     它由 Puerts 的 DeclarationGenerator 生成，新增蓝图资产后需要重新生成，
 *     否则新资产的类型不在声明里，编译会报「找不到命名空间」。
 * ----------------------------------------------------------------------------
 */
