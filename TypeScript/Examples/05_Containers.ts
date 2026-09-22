/**
 * ============================================================================
 *  05 · 容器与类型转换
 * ============================================================================
 *
 *  UE 的 TArray / TMap / TSet 和 JS 的 Array / Map / Set 不是一回事，
 *  不能混用。本文件讲清楚：
 *
 *    ① TArray 怎么建、怎么增删改查、怎么遍历（可以直接 for...of！）
 *    ② 把 TArray 当「出参」传给 UE 函数的正确姿势（重要）
 *    ③ TMap / TSet 的基本用法
 *    ④ 结构体（Struct）怎么创建和传递
 *    ⑤ FName / FString / FText 的区别
 * ============================================================================
 */

import * as UE from 'ue';
import { Title } from './index';

export function Run(World: UE.World): void {
    Title(5, '容器与类型转换');

    // ========================================================================
    // ① TArray —— UE 的动态数组
    // ========================================================================
    //
    // ⚠️ 千万别用 [] 直接造一个数组冒充 TArray，UE 那边认不出来。
    //    必须用 UE.NewArray(元素类型) 创建。

    const Numbers = UE.NewArray(UE.BuiltinInt);   // 等价于 C++ 的 TArray<int32>
    Numbers.Add(10);
    Numbers.Add(20);
    Numbers.Add(30);
    Numbers.Add(40, 50);                          // Add 支持一次加多个

    console.log(`[05] Numbers 长度 = ${Numbers.Num()}`);

    // 读单个元素：Get(索引)
    console.log(`[05] Numbers[1] = ${Numbers.Get(1)}`);

    // ★ TArray 实现了迭代器协议，所以可以直接 for...of，不用写索引循环
    let Sum = 0;
    for (const N of Numbers) {
        Sum += N;
    }
    console.log(`[05] 求和 = ${Sum}`);

    // 查找与判断
    console.log(`[05] 包含 30 吗？ ${Numbers.Contains(30)}`);
    console.log(`[05] 30 的下标 = ${Numbers.FindIndex(30)}`);

    // 删除（按索引）
    const Idx = Numbers.FindIndex(30);
    if (Idx >= 0) Numbers.RemoveAt(Idx);
    console.log(`[05] 删掉 30 之后长度 = ${Numbers.Num()}`);

    // 清空
    Numbers.Empty();
    console.log(`[05] 清空后长度 = ${Numbers.Num()}`);

    // ========================================================================
    // ② 把 TArray 当出参传给 UE 函数 —— 最常用的场景
    // ========================================================================
    //
    // GetAllActorsOfClass 的类型定义长这样：
    //     (WorldContext, ActorClass, OutActors: $Ref<TArray<UE.Actor>>) : void
    //
    // 注意第三个参数是 $Ref<...> 而不是返回值 —— UE 会把结果**填进**这个数组。
    //
    // 正确做法：先用 UE.NewArray 造一个空数组传进去，函数执行完数组里就有数据了。

    const AllActors = UE.NewArray(UE.Actor);
    UE.GameplayStatics.GetAllActorsOfClass(
        World,
        UE.Actor.StaticClass(),
        AllActors as any      // ← 这里的 as any 是躲类型系统的，运行时不需要
    );

    console.log(`[05] 当前世界里一共有 ${AllActors.Num()} 个 Actor`);

    // 只打印前 8 个，避免刷屏
    let Shown = 0;
    for (const A of AllActors) {
        if (Shown >= 8) {
            console.log(`[05] ...（还有 ${AllActors.Num() - 8} 个未显示）`);
            break;
        }
        console.log(`[05]   - ${A.GetName()}  (${A.GetClass().GetName()})`);
        Shown++;
    }

    // ========================================================================
    // ③ TMap / TSet
    // ========================================================================
    //
    // 内建类型要传 BuiltinXxx 常量，不是 UE.Int 这种写法：
    //   BuiltinBool / BuiltinInt / BuiltinFloat / BuiltinDouble
    //   BuiltinString / BuiltinText / BuiltinName / BuiltinInt64 / BuiltinByte

    const ScoreMap = UE.NewMap(UE.BuiltinString, UE.BuiltinInt);
    ScoreMap.Add('PlayerA', 100);
    ScoreMap.Add('PlayerB', 250);

    console.log(`[05] 地图里有 ${ScoreMap.Num()} 条记录`);
    console.log(`[05] PlayerB 的分数 = ${ScoreMap.Get('PlayerB')}`);
    // ⚠️ TMap 没有 Contains，判断「键在不在」用 Get 返回值是否为 undefined
    console.log(`[05] 有 PlayerC 吗？ ${ScoreMap.Get('PlayerC') !== undefined}`);

    const TagSet = UE.NewSet(UE.BuiltinString);
    TagSet.Add('Ability.Dash');
    TagSet.Add('Ability.Dash');    // 重复添加不会有第二条（Set 语义）
    TagSet.Add('Ability.Melee');
    console.log(`[05] Set 里实际上有 ${TagSet.Num()} 个元素`);

    // ========================================================================
    // ④ 结构体（Struct）
    // ========================================================================
    //
    // 结构体是「值类型」，直接用 new UE.XXX(...) 构造即可。
    // 常见的：Vector / Rotator / Transform / LinearColor / GameplayTag

    const V = new UE.Vector(100, 200, 300);
    console.log(`[05] Vector = (${V.X}, ${V.Y}, ${V.Z})`);

    // 结构体运算走 KismetMathLibrary
    const V2 = new UE.Vector(10, 10, 10);
    const Sum2 = UE.KismetMathLibrary.Add_VectorVector(V, V2);
    const Length = UE.KismetMathLibrary.VSize(Sum2);
    console.log(`[05] 相加后长度 = ${Length.toFixed(2)}`);

    const Rot = new UE.Rotator(0, 90, 0);      // Pitch, Yaw, Roll
    const Forward = UE.KismetMathLibrary.GetForwardVector(Rot);
    console.log(`[05] 朝向 90° 的前向量 = (${Forward.X.toFixed(2)}, ${Forward.Y.toFixed(2)}, ${Forward.Z.toFixed(2)})`);

    // GameplayTag —— 注意必须用构造函数，不能传字符串
    const DashTag = new UE.GameplayTag('Ability.Dash');
    console.log(`[05] GameplayTag = ${DashTag.TagName}`);

    // ========================================================================
    // ⑤ FName / FString / FText
    // ========================================================================
    //
    // 在 TS 里它们**都表现为 string**，正常传就行，不用特殊处理。
    // 区别在 C++ 侧：FName 不区分大小写且做字符串池化，FText 支持本地化。
    //
    // 需要真正的 FName 时（极少数情况，比如按名字查函数），用 FNameLiteral：
    //   const N = FNameLiteral("MyFunctionName");

    const ActorName: string = AllActors.Num() > 0 ? AllActors.Get(0).GetName() : '(空)';
    console.log(`[05] 第一个 Actor 的名字（FString）= ${ActorName}`);

    UE.KismetSystemLibrary.PrintString(
        World,
        `世界里有 ${AllActors.Num()} 个 Actor，详见 Output Log`,
        true, true, new UE.LinearColor(0, 1, 1, 1), 8.0, 'Example_5'
    );
}

/*
 * ----------------------------------------------------------------------------
 *  小结
 * ----------------------------------------------------------------------------
 *  · TArray 一定要用 UE.NewArray() 造，别拿 JS 数组冒充
 *  · TArray 支持 for...of，比写索引循环清爽
 *  · UE 的「数组出参」：造空数组 → 传进去 → 函数填好 → 你直接读
 *  · TMap/TSet 用 UE.NewMap/NewSet，键值类型传 BuiltinXxx 常量
 *  · 结构体用 new UE.Vector(...) 这种构造；FName/FString/FText 在 TS 里都是 string
 * ----------------------------------------------------------------------------
 */
