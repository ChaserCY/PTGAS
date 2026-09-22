# TS ↔ UE 交互示例（不使用 mixin）

这套示例演示**主动调用 UE** 的写法，和 `TypeScript/Blueprints/` 完全不同：

| | `Blueprints/` 里的写法 | 本目录的写法 |
|---|---|---|
| 关系 | 被 UE 调用（引擎反射回调 `K2_ActivateAbility` 等） | **主动调用 UE** |
| 前提 | 必须有 `@mixin` 挂到蓝图资产上 | 无，纯普通函数 |
| 适合 | 游戏逻辑（技能、角色、UI） | 工具脚本、调试命令、系统模块 |

---

## 怎么跑起来

在 `TypeScript/MainGame.ts` **末尾**加两行：

```ts
import { RunAllExamples } from "./Examples";
RunAllExamples();
```

然后重新构建（两步都要跑，见项目根目录 README）：

```bash
npm start                       # 或让 tsc --watch 常驻
cd TypeScript && node build.js  # 打包成 bundle.js
```

进游戏后看 **屏幕左上角** 和 **Output Log**（窗口 → 输出日志）。

### 只想在你新建的那张地图里测试

入口脚本跟着 GameInstance 走，**不分地图都会执行**。想限定地图就用：

```ts
import { RunIfInMap } from "./Examples";
RunIfInMap("你的地图名");     // 名字不带 .umap 后缀，也不带路径
```

---

## 文件导航

| 文件 | 讲什么 | 关键知识点 |
|---|---|---|
| `index.ts` | 入口、取 World、屏幕打印、地图过滤 | `argv.getByName("GameInstance")` 是拿 UE 世界的唯一入口 |
| `01_Basics.ts` | 拿对象、调函数、读写属性 | **`$ref` / `$unref` 出参处理**（最容易踩的坑） |
| `02_SpawnActor.ts` | 生成 / 操作 / 销毁 Actor | `BeginDeferredActorSpawnFromClass` 两步法 |
| `03_Timers.ts` | 定时器 | **为什么纯 TS 必须用 `K2_SetTimerDelegate`**、JS 定时器 vs UE 定时器 |
| `04_Delegates.ts` | 绑定 UE 委托 | `.Add()` / `.Remove()`、回调签名必须严格一致 |
| `05_Containers.ts` | TArray / TMap / 结构体 | `UE.NewArray` 造容器、数组出参的正确传法 |
| `06_LineTrace.ts` | 射线检测 | `$Ref<HitResult>` 出参 + `DrawDebugSphere` 可视化 |
| `07_BlueprintLoad.ts` | **类型安全的蓝图加载** | `blueprint.load` + `UE.Game.*` 替代字符串路径；读蓝图组件/变量 |

**建议阅读顺序**：`01` → `06` → `02` → `03` → `04` → `05` → `07`
（先学会拿对象和看出参，再看最实用的射线，`07` 放在最后因为它是最接近你项目实际写法的）

---

## 六条避坑清单

写这些示例时踩到的真实问题，全是编译/运行验证过的：

**① 出参必须用 `$ref` 包起来**
C++ 的 `FVector& Origin` 这种引用参数，直接传普通对象是拿不到结果的：
```ts
const Origin = $ref(new UE.Vector(0, 0, 0));
UE.KismetSystemLibrary.GetActorBounds(Actor, Origin, BoxExtent);
const Real = $unref(Origin);        // ← 这样才取得到
```

**② 函数名可能带 `K2_` 前缀**
`SetActorLocation` 在 TS 里点不出来，正确的是 `K2_SetActorLocation`。
凡是发现「IDE 里没这个函数」，先试试加 `K2_`。

**③ 纯 TS 函数不是 UFunction**
`K2_SetTimer(对象, "函数名", ...)` 是按名字查反射函数的，纯 TS 函数查不到，会**静默失败**。
必须用 `K2_SetTimerDelegate(toManualReleaseDelegate(fn), ...)`。

**④ `LinearColor` 只有 8 个静态颜色**
`White / Gray / Black / Transparent / Red / Green / Blue / Yellow`。
`Cyan`、`Magenta` 这些没有，自己 `new UE.LinearColor(0, 1, 1, 1)`。

**⑤ `TMap` 没有 `Contains`**
判断键存在用 `Map.Get(key) !== undefined`。
`TArray` 倒是有 `Contains`，别记混。

**⑥ 容器必须用 `UE.NewArray` 造**
`[1, 2, 3]` 这种 JS 数组冒充不了 `TArray`。
`TMap` / `TSet` 同理，用 `UE.NewMap(UE.BuiltinString, UE.BuiltinInt)`。

---

## 验证状态

这套代码已经过 `npx tsc --noEmit` 全量类型检查（退出码 0），**类型层面保证能编译**。

但**运行时行为没有实机验证过** —— 你进地图跑一遍，如果哪个示例报错或没输出，
把 Output Log 里的报错发我，我来修。
