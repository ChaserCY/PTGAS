# PTGAS 模块化增量热更 · 技术可行性实行计划书

> 版本：**v5**（简化版：砍掉依赖图 / delta / 重载集 / esbuild 管线，增量改由客户端哈希自算）
> 日期：2026-09-24
> 对象工程：`PTGAS`（UE 5.3 + PuerTS + TypeScript 4.7.4；构建只用 `tsc --watch`，esbuild 退出热更管线）
>
> **修订链**：
> - **v1 → v2**：自查勘误三处（见 §0.1）
> - **v2 → v3**：新增 §3.6「绑在关卡切换上生效」（消除风险 R3b）
> - **v3 → v4**：合并外部复核（§九）并**逐条独立验证**（§9.6）；据此重写 §2 问题 6、补充 §3.2 tag 边界 / §3.3 `minBaseVersion` 语义 / §3.4 三个回退细节，并修正若干跨节引用
> - **v4 → v5**：**按「简化版」重构** —— 移除 `deps` 依赖图、`delta.json`、重载集、esbuild metafile 管线；增量下载由客户端逐文件比对哈希实现（§3.4 第 4 步不变）；构建链保留 `tsc --watch`（阶段 1 缩为一行入口改动）；新增 §3.7「未来优化路径」收纳被砍机制与重启触发条件；工作量 14–20 → 9–13 人天
>
> **关于复核状态（如实说明）**：
> - **步骤 4 `second-opinion`**：该 Skill 配置为 `disable-model-invocation`，**只能由你本人执行**；你已执行并产出 §九，我无权调用亦未复刻。
> - **步骤 5 `codex exec`**：`codex-cli 0.155.1` 在 PATH 中，但本地后端代理 `http://127.0.0.1:15721` 不可达（连接失败 → `502`），**该步仍未完成**。
>
> ⚠️ **我对 §九 的验证结论**：源码级论断**条条属实**，但其中一条**量化数据算错了**（sourcemap，高估约 5 倍）。详见 **§9.6** —— 复核意见同样需要被复核。

---

## 〇、先给结论

| 你的诉求 | 可行性 | 一句话结论 |
|---|---|---|
| TS 按模块拆成多个 JS 文件热更 | **完全可行，且改造量极小** | `tsc` 本来就已经产出「每文件一个 CommonJS 模块」，Puerts 的模块执行器提供完整 Node 风格 CJS 包装，现在只是被 esbuild 强行合并成了一个 `bundle.js` |
| 服务器端清单 + 增量下载 | **完全可行，已用原型验证** | 服务端只发「全量清单（hash + size）+ 全量文件快照」；差异由**客户端**逐文件比对哈希得出（已跑通：31 个模块 / 94,927 字节）。**无需依赖图、无需 delta.json** |
| 运行时清除 V8 缓存 | **必须清，但不止一处** | 有 **三层**缓存要处理，只清 `moduleCache` 会得到一个「半新半旧」的危险状态 |
| 不重启进程、运行中更新代码 | **可行，但要选对路线** | Puerts 官方的「原地替换函数体」路线（`ReloadModule` → V8 `setScriptSource`）**依赖 Inspector**：移动端/主机默认没有，桌面端有但官方自己说「发布版不建议开启」；生产环境建议走「脚本环境软重启」（§3.5 路线 A） |

**核心提醒**：你把「分模块」和「不重启」当成了一件事，**它们其实是两个正交的问题**。
- 「分模块」解决的是**下载粒度**（网络层）
- 「不重启生效」解决的是**运行时替换**（V8 / mixin 层）

分开设计，各自都有干净的解法；混在一起想，就会觉得处处是坑。

> **v5 补充**：「分模块」在 v5 里的作用 = **客户端哈希比对的粒度**（只有变化的文件需要下载）+ 为路线 B 保留文件边界。依赖图 / 重载集 / `delta.json` **不再是本方案的组成部分**（降级为 §3.7 未来路径）—— 当前 95KB 的体量撑不起它们的复杂度。

### 0.1 自查修订记录（v1 → v2）

初版写完后我自己回头逐条复核源码，**推翻了自己初版的三处结论**。列在这里，因为它们都是「看起来对、实际会把人带沟里」的那种错：

| # | v1 的错误结论 | 复核后的正确结论 | 影响 |
|---|---|---|---|
| **勘误 1** | 「V8 Inspector **仅编辑器可用**，打包版 `Inspector == nullptr`」 | 真门控是 `V8InspectorImpl.cpp:17` 的 `(WINDOWS \|\| MAC \|\| LINUX \|\| WITH_INSPECTOR) && !WITHOUT_INSPECTOR` —— **Win64 打包版也有 Inspector**；只有移动端/主机需要手动定义 `WITH_INSPECTOR`。我当初被文件末尾 `:611` 的**过期注释**骗了 | 结论从「生产完全不可用」修正为「**分平台**，但官方自己不建议在发布版开启」。§3.5 的路线选择不变，理由更准确 |
| **勘误 2** | 「`Saved/` 优先方案**必然失败**，因为 `Saved/` 里没有未变更的模块」 | 错。`DefaultJSModuleLoader.cpp:118-120` 有**回落 `Content/JavaScript/`** 的分支。真正的致命伤是**相对路径 require 的遮蔽失效**（旧文件还在 `Content/` 里，相对解析永远先命中它） | §1.3 整节重写，并把「为什么不能换 `ScriptRoot`」的理由换成正确的那个 |
| **勘误 3** | 软重启风险「**高**」，因为是纸面推演 | `GAS_GameInstance.cpp:66-71` 的 `Shutdown()` **当前就在调 `GameScript.Reset()`** —— 这条拆卸路径每天都在真实执行。且已验证 `FJsEnv` 非 `TSharedFromThis`、唯一持有者、`IJsEnv` 虚析构，`Reset()` 确实会触发 `~FJsEnvImpl` 与 mixin 还原 | 风险下调为「中」。阶段 0.2 要验的从「Reset 是否安全」缩小为「**中途** Reset 是否安全」 |

**另外补充的新证据**（v1 没有）：`GAS_GameInstance.cpp:9-25` 有一段**被注释掉的、和你想法几乎一样的历史实现**（把 `ScriptRoot` 指到 `Saved/`），§1.3 分析了它为什么走不通。

**还有一个新暴露的设计缺口**：v1 假设「覆盖写 `Content/JavaScript/`」总是可行，但**移动端/主机的 `Content/` 是只读的**。当前 Windows 打包版没问题（你现有的热更就是这么写的），但**目标平台一旦包含移动端，落盘策略必须改**。已列为待确认事项第 1 条（最高优先级）。

---

## 一、技术可行性判定

### 1.1 已确认的技术事实（全部来自本仓库源码，可逐条复核）

这一节是后面所有设计的依据。**每条都标了文件与行号，请抽查**。

#### 事实 1：`tsc` 已经产出「每文件一个 CommonJS 模块」，模块化无需重建构建链

`Content/JavaScript/Blueprints/Ability/_05FireBlast/GA_FireBlast.js` 实际内容：

```js
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_GameplayAbility_1 = require("../BP_GameplayAbility");
```

相对路径 `require` 完整保留。`tsconfig.json` 里没有 `paths` / `baseUrl` 别名，**所有 import 都是相对路径** —— 这意味着产物可以脱离任何 bundler 直接运行。

#### 事实 2：Puerts 的模块执行器提供完整 Node 风格 CJS 包装

`Plugins/Puerts/Content/JavaScript/puerts/modular.js:62`：

```js
let wrapped = evalScript(
    "(function (exports, require, module, __filename, __dirname) { " + script + "\n});",
    debugPath, isESM, fullPath, bytecode
);
wrapped(exports, puerts.genRequire(fullDirInJs), module, fullPathInJs, fullDirInJs)
```

与 Node 的 CJS 包装逐字一致。**所以 `tsc` 的产物可以直接被 Puerts 加载，不需要 esbuild。**

#### 事实 3：模块解析基于文件系统，支持 `..` 回溯

`DefaultJSModuleLoader::Search`（`DefaultJSModuleLoader.cpp:97`）先按「调用方所在目录」解析，再逐级向上，最后回落到 `FPaths::ProjectContentDir() / ScriptRoot`。`ScriptRoot` 在 `GAS_GameInstance.cpp:27` 写死为 `"JavaScript"`。

#### 事实 4：`ReloadModule` / `__reload` 这条链路依赖 Inspector，而 Inspector 是**平台门控**的 ⚠️

> **勘误**：我第一版把这里的条件写成了 `WITH_EDITOR && (WINDOWS || MAC)`。那是被文件末尾 `V8InspectorImpl.cpp:611` 的**过期注释**误导了 —— 注释没跟着代码更新。真正的门控在文件开头 `V8InspectorImpl.cpp:17`，条件宽得多。以下是复核后的正确结论。

`V8InspectorImpl.cpp:17`（真正的门控）：

```cpp
#if (PLATFORM_WINDOWS || PLATFORM_MAC || PLATFORM_LINUX || defined(WITH_INSPECTOR)) && !defined(WITHOUT_INSPECTOR)
    // ... 真实现：V8InspectorClientImpl（websocketpp 通道）
    V8Inspector* CreateV8Inspector(int32_t Port, void* InContextPtr) {   // :592
        return new V8InspectorClientImpl(Port, *ContextPtr);
    }
#else
    V8Inspector* CreateV8Inspector(int32_t Port, void* InContextPtr) {   // :605
        return nullptr;
    }
#endif    // ← :611 的注释写的是 "WITH_EDITOR && (PLATFORM_WINDOWS || PLATFORM_MAC)"，与代码不符，是过期注释
```

`WITHOUT_INSPECTOR` 只在 `JsEnv.Build.cs:620` 的 `ThirdPartyQJS()`（QuickJS 后端）里定义。本工程 `JsEnv.Build.cs:30-36` 是 `UseQuickjs = false` / `UseNodejs = false` → **走 V8，`WITHOUT_INSPECTOR` 未定义**。

**所以修正后的结论是分平台的**：

| 平台 | `CreateV8Inspector` | `ReloadModule` 链路 |
|---|---|---|
| Win64（编辑器 **和** 打包版） | 真实现 | **存在**，理论可用 |
| Mac / Linux | 真实现 | 存在 |
| Android / iOS / 主机 | **`nullptr`** | **不可用**，除非自行 `PrivateDefinitions.Add("WITH_INSPECTOR")` |

`JsEnvImpl.cpp:620` → `Inspector = CreateV8Inspector(InDebugPort, &Context);`，`hot_reload.js` 的 `reload()` 依赖 `setInspectorCallback` / `dispatchProtocolMessage`（`JsEnvImpl.cpp:527-530` 注册，`4526` 处 `if (!InspectorChannel) InspectorChannel = Inspector->CreateV8InspectorChannel();`）。

**但「存在」不等于「能用」** —— 以下都是官方侧的一手证据，指向同一条链路：

- **Issue #115（open）**，作者 chexiongsheng 原话：「开启inspector功能就能用。**不过发布到外面的游戏一般不建议开启。**」
- **Issue #1281（closed）**，Android + UE 4.27.2：打包后 `hot_reload.js` 的 `await sendCommand("Runtime.enable", {})` 永不返回，热更卡死。
- **Issue #1286（closed）**，官方给的解法就是「移动端定义 `WITH_INSPECTOR` 宏即可」—— 反证了移动端默认不可用。
- **Issue #2000（open）**，**用的正是本工程同款 PuerTS 1.0.5**，UE 5.1 / Shipping / LTO / O2，用官方 `v8-hot-reload-kit` 时触发内存访问违例（`0x00000000000000D0`）。官方回复称 win64 Shipping 实测不崩、可正常连接，但**该 issue 至今 open**。

> 顺带一提：`hot_reload.js:91` 里 `//puerts.forceReload(url);` 是被注释掉的，`setScriptSource` 只改脚本文本、**不会重新执行模块体**，所以即便在编辑器里它也只适合 DevTools 单步调试式的改法。

**对本方案的影响**：`ReloadModule` 不能作为生产热更的**唯一**路径（移动端没有、桌面端有稳定性疑云、且官方自己不建议在发布版开启）。本计划书 §3.5 因此给出两条**不依赖 Inspector** 的路线。

#### 事实 5：二次 mixin 会被 C++ 拒绝

`JsEnvImpl.cpp:4369`：

```cpp
if (MixinClasses.Contains(To)) {
    FV8Utils::ThrowException(Isolate, "had mixin");
    return;
}
```

**必须先 unmixin 才能重新 mixin。** 释放路径在 `Info[5] == true` 分支（`JsEnvImpl.cpp:4362-4366`）→ `UJSGeneratedClass::Restore(To)`，JS 侧入口是 `blueprint.unmixin(cls)`（`uelazyload.js:245`）。

#### 事实 6：`blueprint.mixin` 有一个「原型不覆盖」守卫 ⚠️

`uelazyload.js:221-231`：

```js
let jsCls = UEClassToJSClass(cls);
Object.getOwnPropertyNames(mixinMethods).forEach(name => {
    if (!jsCls.prototype.hasOwnProperty(name)) {     // ← 已经是自己的属性就跳过
        Object.defineProperty(jsCls.prototype, name, ...);
    }
});
```

而 `UEClassToJSClass` 背后的 `GetJsClass`（`JsEnvImpl.cpp:3149`）按 `TypeReflectionMap`（key 为 `FullName`，`JsEnvImpl.cpp:3030`）**缓存 JS 类包装**，同一个 UClass 永远返回同一个 `jsCls`。

**后果**：unmixin → 重新 mixin 之后，
- **引擎回调进来的入口**（`K2_ActivateAbility`、`ReceiveBeginPlay`）走的是 C++ 新建的 `UJSGeneratedFunction` → **新代码** ✅
- **TS 内部 `this.xxx()` 的调用**走 JS 原型链 → 命中旧的 own property → **旧代码** ❌

于是你会得到一个「一半新一半旧」的状态 —— 这是模块级热替换最容易踩的坑，比崩溃更难查。

#### 事实 7：销毁 `FJsEnv` 会自动清理所有 mixin

`JsEnvImpl.cpp:899-906`（析构函数内）：

```cpp
for (size_t i = 0; i < MixinClasses.Num(); i++) {
    if (MixinClasses[i].IsValid()) {
        UJSGeneratedClass::Restore(MixinClasses[i].Get());
    }
}
```

并且 `Restore` 里会 `JGF->JsFunction.Reset()`（`JSGeneratedClass.cpp:312`）释放 v8 持久句柄；`TypeReflectionMap` 是 `FJsEnvImpl` 的成员，随对象一并销毁 —— 新 JsEnv 拿到的是全新空表。

**这意味着「重建 JsEnv」是一条干净、彻底的路径**，不需要你自己去逐个 unmixin。

**`Reset()` 能否真的触发析构？能 —— 已逐条验证（这是路线 A 的命门）：**

| 检查项 | 结论 | 依据 |
|---|---|---|
| `FJsEnv` 是否继承 `TSharedFromThis`？ | **否**（源码里那行被注释掉了：`// : public TSharedFromThis<FJsEnv> // only a wrapper`）→ **内部无法持有自身的强引用** | `JsEnv.h:63` |
| 是否存在外部第二持有者？ | **否**，全工程只有 `UGAS_GameInstance::GameScript` 一个 | `grep -rn "FJsEnv>" Source/` 仅 3 处命中，均为同一成员 |
| 基类析构是否虚函数？ | **是**（`virtual ~IJsEnv() {}`）→ 经 `std::unique_ptr<IJsEnv>` 删除能正确调到 `~FJsEnvImpl` | `JsEnv.h:60-62` |

**所以 `GameScript.Reset()` → 引用计数归零 → `~FJsEnvImpl` → mixin 全部 Restore，成立。**

**更强的佐证**：`GAS_GameInstance.cpp:66-71` 的 `Shutdown()` **当前就已经在调 `GameScript.Reset()`** —— 也就是说这条拆卸路径**在你的项目里每天都被真实执行**（每次退出游戏），不是纸面推演。阶段 0.2 要验的是「**中途** Reset 是否安全」，而不是「Reset 本身是否安全」，风险等级因此下调。

#### 事实 8：`FJsEnvImpl::Start` 只能调用一次

`JsEnvImpl.cpp:3494`：

```cpp
if (Started) { Logger->Error("Started yet!"); return; }
```

所以软重启**必须新建 `FJsEnv` 实例**，不能在原实例上重来。

#### 事实 9：委托代理在析构时会被安全清理

`JsEnvImpl.cpp:788-800`（析构内）：

```cpp
for (auto Iter = DelegateMap.begin(); Iter != DelegateMap.end(); Iter++) {
    Iter->second.JSObject.Reset();
    if (Iter->second.Proxy.IsValid(true)) {
        Iter->second.Proxy->JsFunction.Reset();     // 释放 v8 持久句柄
    }
    Iter->second.JsCallbacks.Reset();
}
```

且 `UDynamicDelegateProxy::DynamicInvoker` 是 `TWeakPtr`（`DynamicDelegateProxy.h:38`）—— JsEnv 销毁后弱引用失效，**残留的 UE 委托变成安全 no-op，不会野指针**。

**但注意**：旧的代理仍**挂在** UE 的多播委托上（只是变成哑弹）。软重启后如果 TS 再 `.Add()` 一次，多播委托里会同时存在「旧哑弹 + 新实体」两条。**这是软重启方案必须处理的副作用**（见 §六 风险 R3）。

#### 事实 10：无 V8 字节码缓存、无多线程

- `JsEnv.Build.cs:54` → `WithByteCode = false`（默认）→ 不存在 `.mbc` / `.cbc` 缓存文件要失效
- `ThreadSafe = false` → 单线程模型，热更必须在**游戏线程**执行

---

### 1.2 四维评估

| 维度 | 评估 | 说明 |
|---|---|---|
| **技术成熟度** | 中高 | 「清单 + 增量下载 + 校验」是业界成熟模式；但「Puerts 运行时模块级热替换」官方文档**未收录**（`unmixin` / `forceReload` / `ReloadModule` 在官方文档站均查不到，只在源码里），属于需要自己兜底的地带 |
| **实现成本** | 中 | 构建链改造小（去掉 bundle 即可）；主要成本在 C++ 侧的脚本环境生命周期管理 + TS 侧的可重入引导 + 服务端脚本 |
| **环境兼容性** | 好 | 不需要改引擎、不需要改 Puerts 插件；`DirectoriesToAlwaysStageAsNonUFS` 已在 `DefaultGame.ini` 配好 |
| **运维复杂度** | 中 | 需要引入「发布流程」（生成清单 → 上传 → 灰度）和「回滚预案」 |

**综合判定：可行，建议实施。** 但必须按 §3 的分阶段推进，先做「前置验证 Spike」，不要一上来就全量重构。

### 1.3 一段被放弃的历史实现（**重要参考**）

`GAS_GameInstance.cpp:9-25` 里躺着一整段被注释掉的代码，是**之前有人尝试过的、和你现在想法几乎一样的方案**：

```cpp
// 我们把热更目录直接定死在 Saved/JavaScript/
// FString HotPatchDir = FPaths::Combine(SavedDir, TEXT("JavaScript/"));
// FString TestFile  = FPaths::Combine(HotPatchDir, TEXT("bundle.js"));
// bool bExist = FPaths::FileExists(TestFile);
// FString ScriptRoot = bExist ? HotPatchDir : TEXT("JavaScript");   // ← 关键
// ...
// auto ModuleLoader = std::make_unique<puerts::DefaultJSModuleLoader>(ScriptRoot);
```

思路是：热更文件放 `Saved/JavaScript/`，存在就让 Puerts 的 `ScriptRoot` 指过去。

> **勘误**：我一开始以为这条路「必然失败」，理由是「`Saved/` 里只有变更的几个文件，其余模块找不到」。**这个理由是错的** —— 我漏看了 `DefaultJSModuleLoader.cpp:118-120`：
> ```cpp
> return SearchModuleInDir(FPaths::ProjectContentDir() / ScriptRoot, RequiredModule, Path, AbsolutePath) ||
>        (ScriptRoot != TEXT("JavaScript") &&
>            SearchModuleInDir(FPaths::ProjectContentDir() / TEXT("JavaScript"), RequiredModule, Path, AbsolutePath));
> ```
> **当 `ScriptRoot != "JavaScript"` 时，加载器会回落到 `Content/JavaScript/`。** 所以未变更的模块是找得到的，这条路并不像我以为的那样直接死掉。

**它真正的致命伤在别处 —— 相对路径 require 的「遮蔽失效」**：

`Search()` 的解析顺序是「**先调用方所在目录，再逐级向上，最后才回落**」（`DefaultJSModuleLoader.cpp:96-120`）。而本工程**所有** import 都是相对路径（`tsconfig.json` 无 `paths`/`baseUrl` 别名）。

于是：

```
底包里的 Content/JavaScript/Blueprints/BP_X.js  →  require("./BP_GameplayAbility")
                                                      ↓
              解析起点是「调用方所在目录」= Content/JavaScript/Blueprints/
                                                      ↓
                         命中 Content/JavaScript/Blueprints/BP_GameplayAbility.js  ← 旧代码 ❌
                                                      ↓
        （根本轮不到回落到 Saved/JavaScript/，因为 Content 里已经有了）
```

**只要一个模块的「旧版本」还存在于 `Content/`，相对 require 就永远命中旧的，`Saved/` 里的新版本被完全遮蔽。** 这是相对路径解析顺序决定的，不是配置问题。

**结论：`Saved/` 优先的方案与本工程的「全相对路径」写法不兼容。**

---

**本方案的对策**（§3.2）：**不换 `ScriptRoot`**，始终让它指向 `Content/JavaScript/`；热更的落盘方式是「把新文件**覆盖写进** `Content/JavaScript/`，旧文件先备份到 `Saved/`」。这样：

- 未变更的模块继续从底包加载，**天然满足增量** ✅
- 变更的模块**原地被替换**，相对 require 解析到的就是新代码 ✅
- 回退 = 把备份拷回原路径，`ScriptRoot` 不变 ✅

**代价与前提（必须知道）**：

| 平台 | `Content/` 是否可写 | 影响 |
|---|---|---|
| Windows 打包版（非 Program Files） | ✅ 可写 | 现方案可用（**你当前就是这条路**：`HotUpdateSubsystem.cpp` 已经在往 `Content/JavaScript/bundle.js` 写） |
| Windows 装在 Program Files | ⚠️ 需管理员权限 | 需改用可写的安装目录 |
| Android / iOS / 主机 | ❌ **不可写**（签名只读） | **现方案会失败**，必须换方案 |

**如果将来要上移动端**，正确解法不是 `Saved/` 优先，而是**实现自定义 `IJSModuleLoader`**：`Load()` 时先查 `Saved/`、未命中再查 `Content/`，**并把「模块路径 → 实际来源」的映射缓存下来**，让相对 require 也能被重定向。官方在 issue #1245 里给的就是这个建议（「实现 `IJSModuleLoader` 可以实现任意你想要的加载效果」）。

> 这也是本计划书 §3.2 把加载器抽象成一个**可替换接口**、而不是写死 `DefaultJSModuleLoader` 的原因 —— 给移动端留出改造位。当前若只发 Windows，`DefaultJSModuleLoader` + 覆盖写就够了。

---

## 二、你的计划里有哪些问题

逐条对照你的原话。

### ❌ 问题 1（最根本）：把「分模块」和「不重启」当成了一件事

> 原话：「而且只有一个js文件是非常不方便的，我想改成模块化增量更新ts对应的js代码文件」

「一个文件不方便」= **下载粒度**问题。但当前「必须重启」的根因**不是**单文件，而是事实 5/6/7：mixin 的 `UFunction → JS Function` 映射在 C++ 侧固化了。

**就算你把 bundle.js 拆成 100 个文件，只要不处理 mixin，照样得重启。**

这两个问题必须分开设计，否则方案会拧巴。

### ❌ 问题 2：「只上传有变化的文件」不够

> 原话：「服务器上传新的有变化的代码文件，运行一个脚本比对出需要更新的模块代码」

只传变化文件，客户端**无法判断**：
- 本地某个「没变化」的文件是否被玩家改过 / 下载时损坏 / 磁盘写入截断
- 某个文件是不是**该被删除**了（模块下线）

**正确做法**：服务器始终发布**完整清单**（含每个文件的 hash + size），差异由客户端本地算。清单很小 —— 实测 31 条 ≈ 8KB，压缩后 2KB 级别，不值得为它省流量。

### ❌ 问题 3（核心洞察）：**「下载集」≠「重载集」**

> **v5 状态：本节分析正确，但已整体降级为「未来优化路径」（§3.7）**。理由：① 生产路线是 A（软重启），它会**重新执行全部模块**，「重载集」没有消费者；② 「下载集」不需要依赖图 —— 客户端逐文件比对哈希即可（§3.4 第 4 步）；③ 依赖图 / `deps` / `delta.json` 只在路线 B 或「服务端预计算 delta」时才有意义。以下内容保留作为 §3.7 的论证材料，**不进入 v5 实施范围**。

这是你的设想里最关键的缺口。

我在你工程上实测（模拟：改 `BP_GameplayAbility.js` + 改 `GA_BaseResponse.js` + 删 `GA_Melee.js` + 增 `GA_NewSkill.js`）：

```
下载集 3 个 (改 2 / 增 1 / 删 1)
重载集 9 个
  1. Blueprints/Ability/BP_GameplayAbility.js
  2. Blueprints/Ability/BaseAbility/GA_BaseResponse.js
  3. Blueprints/Ability/GA_NewSkill.js
  4. Blueprints/Ability/_01HPRegen/GA_HPRegen.js
  5. Blueprints/Ability/_02Dash/GA_Dash.js
  6. Blueprints/Ability/_03Laser/GA_Laser.js
  7. Blueprints/Ability/_04GroundBlast/GA_GroundBlast.js
  8. Blueprints/Ability/_05FireBlast/GA_FireBlast.js
  9. MainGame.js
```

**为什么下载集只要 3 个，重载集却要 9 个？**

因为 CommonJS 的 `require` 返回的是**对象引用**，而 `class GA_FireBlast extends BP_GameplayAbility` 这种继承关系在**类定义那一刻就固化了**。`BP_GameplayAbility` 改了之后，6 个技能模块手里还攥着旧的基类引用 —— **它们的文件内容没变，不需要重新下载，但必须重新执行**。

| 集合 | 定义 | 用途 |
|---|---|---|
| **下载集** | 内容哈希发生变化的文件（+ 新增 − 删除） | 决定**下载什么**（省流量） |
| **重载集** | 下载集的**反向依赖闭包** | 决定**重新执行什么**（保正确） |

**这两个集合的职责划分**（v3 修订，此前正文前后矛盾，现统一）：

| 集合 | 谁算 | 理由 |
|---|---|---|
| **下载集** | **客户端**（本地实算哈希） | 必须由客户端算 —— 只有它知道本地文件的实际状态（缺失 / 损坏 / 被改） |
| **重载集** | **服务端算好，写进清单；客户端用它，但保留自算能力作为兜底** | 服务端算的是权威结果，便于人工核查；客户端因为清单里带了 `deps`，也能自己算一遍做交叉校验 |

> **为什么不做成「客户端全算」**：客户端要自算就得把全量 `deps` 图随清单下发（实测 31 条 ≈ 8KB，可接受），且要保证客户端算法与服务端一致。做成「服务端算好 + 客户端可选复算」两边都不吃亏。
>
> **为什么不做成「客户端完全不算」**：如果服务端 `delta.json` 生成出错或缺失，客户端有 `deps` 就能自救，不至于卡死。

> 顺带说明：这也是 web 前端 `[contenthash]` 文件名会导致「改一个文件、级联重下 N 个」的同一个问题。我们用**稳定逻辑路径**（路径不带 hash）作为方案，就避免了级联**下载**；但级联**重载**在 CJS 语义下是躲不掉的，只能如实算出来。

### ❌ 问题 4：没有处理「删除」

> 原话：「服务器上传新的有变化的代码文件」

模块下线了怎么办？客户端本地那个文件**还在**。因为 Puerts 的模块解析是**按文件系统路径**找的（事实 3），一个残留的 `GA_OldSkill.js` 完全可能被 `require` 到，然后跑起一份「服务器上已经不存在的代码」。

**v5 修订**：不需要服务端单独下发 `removed` 列表 —— 客户端拿「热更边界内的本地文件 − 新 manifest」即可推导删除集（绝不允许越界删 `puerts/` 等底包目录）。保底事实：CJS 只加载被 `require` 的文件，残留文件若无人引用就是惰性死文件；若删错了仍在用的引用，「就绪心跳」会抓住并触发回滚。

### ❌ 问题 5：没有原子性

现在只有一个 `bundle.js`，`FFileHelper::SaveArrayToFile` 一次性覆盖 —— 天然原子。

拆成多文件后，**这个优点没了**。下载到第 7 个文件时断网 → 本地是「新 6 个 + 旧 25 个」的混合体 → 下次启动可能崩在 `require` 一个半新半旧的模块上。

**必须补回原子性**：下载到临时目录 → 全部校验通过 → 再落地（详见 §3.4）。

### ❌ 问题 6：没有失败回退 —— 而且失败形态比你以为的更隐蔽

新脚本有问题（语法错误、`UE.Class.Load` 路径失效、蓝图被改名）时会发生什么？

**不会崩。** 我复核了 `FJsEnvImpl::Start`（`JsEnvImpl.cpp:3546-3554`）：

```cpp
v8::TryCatch TryCatch(Isolate);
v8::Local<v8::Value> Args[] = {FV8Utils::ToV8String(Isolate, ModuleNameOrScript)};
__USE(Require.Get(Isolate)->Call(Context, v8::Undefined(Isolate), 1, Args));
if (TryCatch.HasCaught())
{
    Logger->Error(FV8Utils::TryCatchToString(Isolate, &TryCatch));   // ← 只打日志
}

Started = true;                                                       // ← 照样置 true
```

**入口 `require` 被 `TryCatch` 包住，异常只写日志，`Start()` 返回 `void`，`Started` 无条件置 true。**

这意味着：

- 坏 JS **不会崩进程**，只会让 TS **静默死掉或半初始化**；
- `RebuildScriptEnv()` **成功返回 ≠ 新代码活着** —— C++ 侧**没有任何返回值可查**；
- 按现有流程会继续 `OpenLevel(Main_Map)`，玩家进入一个 **TS 全灭的关卡**（黑屏 / 技能全失效），且**日志在玩家机器上，你收不到**。

**这比「崩掉」更难查**，所以必须补三样东西：

1. **「脚本就绪心跳」** —— `MainGame.ts` 初始化末尾调一个 `BlueprintCallable` 的 `NotifyScriptReady()`；`Http_Map` **等到心跳（带超时）再 `OpenLevel`**；超时则就地回滚 + 重建脚本环境（或进错误提示页）。**这是「成功」的唯一可信定义**，不能靠「没崩」来判断。
2. **「启动自检 + 自动回退」** —— 保留上一版文件快照，启动时打标记，心跳到达后清标记；下次启动若发现标记还在，自动回滚。
3. **失败版本黑名单** —— 否则会死循环（见下方 §3.4 的说明）。

> 顺带修正本计划书早期的措辞：v1 写的是「新脚本如果一启动就崩……玩家会卡死在启动阶段」。**「崩」这个前提是错的**，实际是静默失效。

### ❌ 问题 7：比对基线不该是「源码 diff」

> 原话：「运行一个脚本比对出需要更新的模块代码」

如果脚本比对的是 **git diff / 源码差异**，会有两个问题：
1. 源码没变但**产物变了**（依赖升级、tsconfig 调整、编译器版本变化）→ 漏更新
2. 源码变了但**产物没变**（只改了注释 / 格式）→ 白更新

**基线应该是「上一版发布时生成的 manifest.json」**，比对的是**构建产物的内容哈希**。这既准确又和 git 解耦。

### ⚠️ 问题 8：V8 缓存「需不需要清」—— 需要，而且有三层

> 原话：「运行时的JS虚拟机缓存数据看需不需要清除清除」

**需要，但不止 `moduleCache` 一处。** 这是第二个最容易踩的坑（第一个是问题 3）：

| 层 | 位置 | 内容 | 是否要清 | 怎么清 |
|---|---|---|---|---|
| **① 模块缓存** | JS 侧 `moduleCache`（`modular.js:52`） | 按**绝对路径**为 key 的模块对象 | **要** | `puerts.forceReload(path)` 打标记（`modular.js:205`），下次 `require` 重新执行模块体 |
| **② mixin 函数映射** | C++ 侧 `MixinFunctionMap`（`JsEnvImpl.h:337` 附近）+ `UJSGeneratedFunction` | `UFunction → v8::UniquePersistent<v8::Function>` | **必须** | **`moduleCache` 清不掉这个**。只能 `blueprint.unmixin` + 重新 mixin，或整个重建 JsEnv |
| **③ JS 类原型** | `TypeReflectionMap` 缓存的 `jsCls.prototype` | TS 方法的 own property | **必须** | 事实 6 的守卫导致不会自动覆盖，需显式 `delete` 或重建 JsEnv |

补充说明：
- **`localModuleCache`（`modular.js:107`，每个 `genRequire(dir)` 闭包一个）不需要单独清** —— 它存的是**同一个 module 对象的引用**，`forceReload` 打的 `__forceReload` 标记会同步生效。
- **V8 字节码缓存不需要清** —— 事实 10，本工程 `WithByteCode = false`。
- **不需要手动 GC** —— 正常重建即可。

**一句话**：`moduleCache` 只是三层里最浅的一层。只清它会得到事实 6 描述的「半新半旧」状态。

### ⚠️ 问题 9：「提示需要热更哪些模块」要分场合

给开发/测试看没问题。**给玩家看的 UI 不要暴露内部模块路径** —— 既是信息泄露，玩家也看不懂「`Blueprints/Ability/_05FireBlast/GA_FireBlast.js` 更新了」是什么意思。

玩家侧建议只显示「资源包 N/M」或干脆只给进度条。模块级明细走日志。

### ⚠️ 问题 10：构建产物目录现在是「混装」的

`Content/JavaScript/` 下现在同时躺着：

| 类别 | 文件 | 是否该进热更清单 |
|---|---|---|
| 业务代码 | `Blueprints/`(28) `Gen/`(1) `MainGame.js` `mixin.js` | ✅ 应该 |
| Puerts 运行时 | `puerts/`(16) `ffi/`(4) `utils/` `wasm/` `react-umg/` `thirdparty/` | ❌ 底包，不该热更 |
| **Node 专用工具** | `FileWatcher.js` `ScanImports.js` | ❌ 它们 `require("fs")`/`require("chokidar")`，**在 V8 里根本跑不起来** |
| 示例代码 | `Examples/`(8) | ❌ 开发用，不该发布 |
| 冗余产物 | `bundle.js` | ❌ 改造后作废 |
| **sourcemap** | `*.js.map`（与业务 JS 一一对应） | ❌ 发布包不该带 |

**如果不做区分，`FileWatcher.js` 会被打进清单、下发给玩家。** 必须在构建脚本里显式划定 include / exclude 边界（原型脚本里已按此实现）。

#### 补充：`.map` 文件（原文档漏项）

`Content/JavaScript` 下今天**同时躺着 sourcemap**，而 `DirectoriesToAlwaysStageAsNonUFS` 是整目录拷贝 —— **它们已经在随包下发给玩家了**。

实测口径（与热更范围同口径，即 31 个业务模块对应的 map）：

| 项 | 字节 | 相对 JS 本体 |
|---|---|---|
| 业务 JS 本体（31 个模块） | 94,927 | 1.00x |
| 对应的 `.js.map`（31 个） | **57,993** | **0.61x** |

> ⚠️ **更正一处外部复核的数字**：复核意见 §9.3-中危 6 称「37 个 / 303,175 字节，是 JS 本体的 3.2 倍」。我把来源反推出来了 —— 那个数把 `bundle.js.map`（127,112 字节，改造后作废）和 `PuertsEditor/` 的 map（114,337 字节，编辑器专用、发布包里没有）一起算进去了，属于**分子分母不同口径**。同口径下是 **0.61 倍，不是 3.2 倍**。结论（该排除）成立，**量级被高估约 5 倍**。

**处置**：
- 发布构建**不产出** sourcemap（或输出到 `Saved/` 等发布目录之外）；
- 热更清单生成器**显式排除** `*.map`（原型脚本的 `collect()` 已含 `!e.name.endsWith('.map')`）；
- 若确实要排查线上问题，**另存一份 map 到内网**，按版本号 + hash 对应，不要混进发布产物 —— 完整 `.map` 里是**可还原的 TS 源码**，泄露程度远超 R8 说的「模块路径泄露」。

---

## 三、整体架构

### 3.1 设计原则

1. **模块边界 = 文件边界**，一个 `.ts` 一个 `.js`，路径稳定不带 hash
2. **服务器算图，客户端照做** —— 反向依赖闭包在构建期算好
3. **下载集与重载集分离**
4. **发布即快照** —— 每次发布留一份完整清单 + 完整文件，支持任意版本回滚
5. **先落地再生效** —— 文件替换与脚本重载是两个独立阶段，前者失败不影响后者
6. **加载器保持可替换** —— C++ 侧通过 `IJSModuleLoader` 接口持有加载器，不把 `DefaultJSModuleLoader` 写死。当前 Windows 用默认加载器即可；将来上移动端时换成「先查 `Saved/` 再查 `Content/`」的自定义实现，**不需要动热更流程本身**（见 §1.3）

### 3.2 构建产物布局（客户端）

```
Content/JavaScript/                 ← 已经是 NonUFS，无需改打包配置
├── MainGame.js                     ← 新入口（原来是 bundle.js）
├── mixin.js
├── Blueprints/**                   ← 业务模块，热更对象
├── Gen/GameplayTags.gen.js         ← 自动生成，热更对象
└── puerts/**  ffi/**  utils/**     ← 底包，不参与热更

Saved/HotUpdate/                    ← 新增：热更运行时状态，刻意放在脚本根目录之外
├── manifest.json                   ← 本地当前版本快照
├── staging/                        ← 下载暂存，全部校验通过才落地
└── backup/                         ← 上一版快照，用于回退
```

> **为什么状态目录放 `Saved/` 而不是 `Content/JavaScript/hotupdate/`**：
> 1. **不被构建工具误扫** —— 清单生成器遍历的是 `Content/JavaScript/`，状态目录放里面就得靠 exclude 规则兜着，多一个出错面；
> 2. **与现有约定一致** —— `HotUpdateSubsystem` 已经在用 `Saved/PersistentDownloadDir/version.json` 存本地版本号；
> 3. **语义清晰** —— `Content/` 是「可执行代码」，`Saved/` 是「运行时数据」，回退时只覆盖 `Content/` 里的文件，两者不混。
>
> 注意：`backup/` 里有业务模块副本，**它不会被执行**（没有任何模块 require 到它），但清理策略要明确 —— 只保留上一版，避免无限增长。

#### ⚠️ 热更边界：`Gen/GameplayTags.gen.js` 能热更，但 **tag 集合不能**

`Gen/GameplayTags.gen.js` 只是包装层，每个 tag 都长这样：

```ts
export const Ability_Dash = new UE.GameplayTag(); Ability_Dash.TagName = "Ability.Dash";
```

**真正的 tag 注册表在 `Config/DefaultGameplayTags.ini`**（`ImportTagsFromConfig=True` + `+GameplayTagList=(Tag="Ability.Dash",...)`），它随 C++/配置**烘焙进底包**，JS 热更动不了它。

| 变更类型 | 能否靠 JS 热更生效 |
|---|---|
| 改了某个 `GA_*` 的逻辑，仍用已有 tag | ✅ 可以 |
| 改了 tag 的**使用方式**（比如换个已有 tag） | ✅ 可以 |
| **新增** tag（`.ini` 加一行 + `.gen.js` 加一行） | ❌ **必须发底包** |
| **改名 / 删除** tag | ❌ **必须发底包**，且旧 JS 会拿到**未注册的空 tag** |

未注册的空 tag 不会抛异常 —— 它会**静默匹配失败**：技能不激活、`BTS_CheckBurming` 之类的判断恒为 false。这类 bug 在玩家机器上几乎无法定位。

**两条硬规则**：
1. **tag 集合变更 = 底包更新**，不进热更范围；热更只能引用底包中**已注册**的 tag。
2. 清单生成器**不比对 `Config/DefaultGameplayTags.ini`**，所以它**发现不了**这类不一致 —— 需要在启动自检里补一条：遍历 `GameplayTags.gen.js` 里用到的 tag，校验 `TagName` 非空且已注册，不通过就走失败回退（§2 问题 6）。

### 3.3 服务器布局

```
/update/
├── version.json                    ← 唯一固定入口 URL（保持现有约定）
├── releases/
│   ├── 1.0.0/
│   │   ├── manifest.json           ← 全量清单
│   │   └── files/                  ← 该版本全量文件（按逻辑路径存放）
│   └── 1.0.1/
│       ├── manifest.json
│       ├── delta.json              ← 相对上一版的差异 + 重载集（可选，客户端也可自己算）
│       └── files/
└── LATEST                          ← 文本文件，内容为最新版本号（可选，便于人工切换/回滚）
```

**`version.json` 格式（保持向后兼容，扩字段）**：

```json
{
  "version": "1.0.1",
  "downloadUrl": "https://your-server/update/releases/1.0.1/manifest.json",
  "manifestUrl": "https://your-server/update/releases/1.0.1/manifest.json",
  "minBaseVersion": "1.0.0",
  "forceUpdate": false
}
```

> `downloadUrl` 沿用旧字段名（原来指向 bundle.js，现在指向 manifest.json）。语义变了，但客户端是我们要改的，老客户端拿到新值会尝试把 JSON 当 bundle 下载 —— **所以要么换 URL，要么在服务端按 User-Agent/版本做分流**。这一点在 §六 风险 R6 说明。

**`minBaseVersion` 的语义（必须定死，否则形同虚设）**：

它表示「**这个热更包要求的最低底包版本**」。什么情况下会需要它？—— 当新 JS 依赖了**旧底包不存在的东西**时：

- 新 JS 调了一个**新加的 `UFUNCTION`/`BlueprintCallable`**（C++ 改了）；
- 新 JS 引用了**新加的 tag**（§3.2 那条边界）；
- 新 JS `UE.Class.Load` 了一个**新蓝图**（`.uasset` 是底包内容）；
- 新 JS 用了新版本 Puerts 的 API。

这些情况**都不是热更能解决的**。所以客户端的处理只有一种：

```
if (compareVersion(localBaseVersion, remote.minBaseVersion) < 0) {
    // 唯一安全动作：不进游戏
    提示「需要更新客户端」 → 跳应用商店 / 下载新的底包
    // 绝不允许：忽略该字段继续热更（必炸）；也绝不允许：静默降级跑旧 JS
}
```

三个配套要求：

1. **`localBaseVersion` 要有可信来源** —— 由 C++ 在**编译期**烧进去（如 `FString BaseVersion = TEXT("1.0.0")` 或 `BuildVersion.h`），**不能**从 `Content/` 里读文件（那正好是被热更改写的区域）。
2. **服务端发布脚本要自动填这个字段** —— 发布时比对本次变更是否触及底包边界（新增 C++ 符号 / tag / 蓝图）。做不到全自动，至少要**强制人工确认**，默认值不能是「空」或「0」。
3. **`forceUpdate` 与它区分开**：`forceUpdate` 是「必须装这个热更」，`minBaseVersion` 是「必须换底包」，两者提示文案和后续动作完全不同，不要混成一个字段用。

**`manifest.json` 格式（原型已产出真实样例）**：

```json
{
  "version": "1.0.1",
  "hashAlgo": "sha256",
  "generatedAt": "2026-09-24T08:00:00.000Z",
  "fileCount": 31,
  "totalSize": 94927,
  "files": {
    "Blueprints/Ability/_05FireBlast/GA_FireBlast.js": {
      "hash": "0196c4e58bcd4214edfd18e83030a3dc62a627ab376d883e14f5c04be5f10887",
      "size": 5053,
      "deps": [
        "Blueprints/Ability/BP_GameplayAbility.js",
        "mixin.js"
      ]
    }
  }
}
```

**`delta.json` 格式（相对某一基线）**：

```json
{
  "from": "1.0.0",
  "to": "1.0.1",
  "downloadSet": {
    "changed": ["Blueprints/Ability/BP_GameplayAbility.js", "..."],
    "added":   ["Blueprints/Ability/GA_NewSkill.js"],
    "removed": ["Blueprints/Ability/_00Melee/GA_Melee.js"]
  },
  "reloadSet": ["Blueprints/Ability/BP_GameplayAbility.js", "...", "MainGame.js"]
}
```

> **为什么 `deps` 要放进清单**：客户端可以用它**自己**算反向闭包，不依赖服务端预生成的 `delta.json`。服务端的 `delta.json` 只是省算力 / 便于人工核查。两者都有，互为兜底。

### 3.4 客户端热更流程（新）

```
                    ┌─────────────────────────────────────┐
                    │ 1. GET version.json                 │
                    └──────────────┬──────────────────────┘
                                   ▼
              ┌────────────────────────────────────────────┐
              │ 2. 本地 manifest 存在 且 版本号一致？        │
              │    否 → 进入更新流程                         │
              └──────────────┬─────────────────────────────┘
                             ▼
                    ┌─────────────────────────────────────┐
                    │ 3. GET manifest.json                │
                    └──────────────┬──────────────────────┘
                                   ▼
              ┌────────────────────────────────────────────┐
              │ 4. 本地校验：逐文件算 sha256 与清单比对        │
              │    → 得 downloadSet {changed,added,removed} │
              │    （本地文件缺失/损坏 也会被算进来，天然自愈）│
              └──────────────┬─────────────────────────────┘
                             ▼
              ┌────────────────────────────────────────────┐
              │ 5. 下载到 Saved/HotUpdate/staging/           │
              │    每个文件下载完立刻校验 sha256，不符即重试    │
              └──────────────┬─────────────────────────────┘
                             ▼
              ┌────────────────────────────────────────────┐
              │ 6. 备份当前文件 → Saved/HotUpdate/backup/    │
              │    再原子替换到 Content/JavaScript/           │
              │    处理 removed 列表（删除）                  │
              │    写 Saved/HotUpdate/manifest.json + 启动标记│
              └──────────────┬─────────────────────────────┘
                             ▼
              ┌────────────────────────────────────────────┐
              │ 7. 触发重载（见 §3.5）                       │
              └────────────────────────────────────────────┘

        下次启动：若发现「启动标记」还在 → 上次没起来 → 自动从 Saved/HotUpdate/backup/ 回滚
```

**关键点**：第 4 步用**本地实算哈希**而不是「记一个版本号」，一举解决「文件被篡改 / 损坏 / 手动删除」三类问题，不需要额外机制。

#### ⚠️ 三个必须补上的细节

**(1) 哈希校验只在「版本号不一致」时才跑 —— 这是个漏洞**

流程图第 2 步是「版本号一致 → 跳过整个流程」。但**文件损坏 / 被杀毒软件删了 / 被玩家手改**这些情况下，**版本号仍然一致**，于是永远不会走到第 4 步的自愈逻辑。低危但真实。

**处置**：版本号一致时，**至少校验入口文件**（`MainGame.js` + `mixin.js`）的 hash；完整校验可以按「上次启动是否成功」或每隔 N 次启动做一次。成本可控，收益是「静默损坏」能被发现。

**(2) 启动标记的检查时机必须早于 `Start()`**

「上次没起来就回滚」这个机制，**检查点必须在 `Init()` 里、`GameScript->Start(...)` 之前**。如果放在后面（比如在 `Http_Map` 里检查），此时**坏代码已经被执行过了** —— 回滚发生在崩溃之后，等于没回滚。顺序是：

```
Init()
  ├─ 读启动标记
  │    └─ 标记存在 → 上次没成功 → 从 backup/ 回滚 → 清标记 → 继续
  ├─ 创建 FJsEnv + Start("MainGame")     ← 坏代码从这里才开始执行
  └─ ...
```

**(3) 失败版本黑名单 —— 否则会死循环**

`backup/` 只有一份，回滚后本地版本号退回到上一版；下次启动又会看到服务器上有新版 → **再下载、再失败、再回滚**，玩家每次启动都要经历一次「下载 → 卡死 → 回滚」，**永远进不去**。

**处置**：回滚时把失败版本号写进 `Saved/HotUpdate/blacklist.json`；更新流程发现目标版本在黑名单里，**直接跳过、用本地版本进游戏**，并把失败信息上报。黑名单条目在**底包版本变化**时清空（换底包后旧 JS 的问题可能已消失）。

> 这三条合起来才构成完整的回退闭环：**能发现失败（心跳）→ 能回到可用状态（标记 + 回滚）→ 不会反复踩同一个坑（黑名单）**。

### 3.5 生效方式：两条路线

#### 路线 A：脚本环境软重启（**推荐用于生产**）

```
UE 进程不重启 → World 不重载 → 只重建 JS 虚拟机
```

C++ 侧改动（`GAS_GameInstance`）：

```cpp
// 新增：重建脚本环境（幂等）
void UGAS_GameInstance::RebuildScriptEnv()
{
    GameScript.Reset();          // 析构 → 自动 Restore 所有 mixin 类（事实 7）
    // 重新 new 一个 ModuleLoader（原 loader 已被 std::move 消费，不能复用）
    // 复用 Init() 里的创建逻辑：Logger + Start("MainGame", Args)
}
```

> `Start` 的入口名从 `"bundle"` 改成 `"MainGame"` —— 顺带修正 `GAS_GameInstance.cpp:58` 那条已经过时的注释。
>
> **完整实现要点见 §3.6**（含三个必踩的坑：loader 被 `std::move` 消费、入口名、调试参数透传）。

**优点**
- 绕开事实 4/5/6 的**全部**坑：新 Isolate、新 `TypeReflectionMap`、新 `MixinClasses`，不存在「半新半旧」
- 实现简单，可靠性高
- 事实 7 保证了拆卸是干净的

**代价（必须正视）**

- TS 层状态全部重置 → UI 需重建、委托需重绑
- 因此**要求 TS 侧写「可重入的引导」**：`MainGame.ts` 及其依赖的初始化逻辑必须幂等
  - 目前 `BP_PlayerController.ReceiveBeginPlay` 里 `WidgetBlueprintLibrary.Create` + `AddToViewport` 是**不可重入**的 —— 软重启后会在旧 UI 之上再叠一层
  - 需要改成「先找已有实例 → 有就销毁/复用 → 再创建」
- 飞行中的技能逻辑、TS 里创建的 AbilityTask 回调会被打断（可接受，但要告知玩家「更新将在当前动作结束后生效」）

**⚠️ 一个必须提前知道的局限：世界里的「老对象」不会被重新初始化**

路线 A 只重建 JS 虚拟机，**不重载 World**。而 `ReceiveBeginPlay` 每个 Actor 一辈子只触发一次。所以软重启之后：

| 对象 | 软重启后状态 |
|---|---|
| 软重启**之后**新建的对象 | ✅ 走新代码，绑定新回调 |
| 软重启**之前**已存在、且已绑过委托的世界对象 | ⚠️ `BeginPlay` 不会重放 → 它的 TS 回调**仍是旧的（且已随旧 Isolate 失效，变成哑弹）** → 该对象的 TS 行为实际"死掉" |

典型受害者就是 `BP_LaserActor` 这类**放置在世界里的 Actor**：它在 `BeginPlay` 里 `.Add()` 了 `OnComponentBeginOverlap`（`BP_LaserActor.ts:19-20`），软重启后这些绑定变成哑弹，**激光碰到人不再触发伤害**。

**因此强烈建议：把软重启和一次关卡重载（或回主菜单）绑定在一起做**，而不是原地软重启。这样世界对象重新 `BeginPlay`，行为完整。这也正好和「等玩家回到安全点再更新」的体验设计一致 —— **该设计已在本工程查证落地，见 §3.6**。

如果确实需要原地软重启，TS 侧就得额外提供 `ReinitWorldObjects()` 之类的钩子，遍历并重新绑定 —— **成本明显更高，不推荐**。

> ✅ **而好消息是：这个局限在你的项目里根本不成立。** 热更发生在纯启动器关卡 `Http_Map`，那里**没有任何已绑定的世界对象**（查证过程见 §3.6）。所以「关卡切换」不是额外加的补丁，而是**你现有流程本来就有的那一步** —— 只需把「杀进程重启」换成「重建脚本环境」。

#### 路线 B：模块级热替换（**建议仅开发期 / 后续演进**）

```
unmixin(受影响的蓝图类) → forceReload(重载集) → 重新 require 入口 → 自动 re-mixin
```

**必须额外处理事实 6 的原型残留** —— `mixin.ts` 要改成覆盖式：

```ts
// mixin.ts 改造示意
const jsCls = blueprint.mixin(JsClass, target, { objectTakeByNative }) as any;
// blueprint.mixin 有 hasOwnProperty 守卫，二次 mixin 不会覆盖旧方法，这里显式覆盖
for (const name of Object.getOwnPropertyNames(target.prototype)) {
    if (name === 'constructor') continue;
    Object.defineProperty(jsCls.prototype, name, Object.getOwnPropertyDescriptor(target.prototype, name)!);
}
```

**其余必须处理的边界**：
- 重载集必须**先全部 `forceReload`**，**再重新 `require` 入口**（顺序反了会拉到旧模块，见 §2 问题 3 的机制说明）
- 模块作用域常量（如 `const MA_FireBlast = UE.Object.Load(...)`）会随模块体重新执行而刷新 ✅
- 已捕获旧 `exports` 引用的地方仍会陈旧 ❌（CJS 语义限制，无法根治）
- 每 unmixin 一次，`Restore` 会创建一个 `ORPHANED_DATA_ONLY_xxx` 临时 UClass 承接旧函数（`JSGeneratedClass.cpp:275`）—— 频繁热更会累积，属已知成本

**建议**：路线 B 作为**开发期提速工具**（改完即见），生产环境走路线 A。两者共用同一套「清单 + 下载」基础设施。

### 3.6 生效时机：绑在关卡切换上（**已查证，强烈推荐**）

§3.5 指出路线 A 有个局限：原地软重启会让世界里的老对象 TS 行为静默失效。**查证后发现，你的项目结构天然规避了这个问题** —— 因为热更本来就发生在一个**纯启动器关卡**里。

#### 查证结果

`Content/Maps/Http_Map.umap` 里引用的**全部**资产与类：

```
/Game/BluePrints/Widget/WBP_Start     ← 启动器 UI（纯蓝图，无 TS）
/Script/PTGAS                          ← HotUpdateSubsystem
/Game/Maps/Main_Map                    ← 目标关卡
```

**没有** Pawn、**没有** PlayerController、**没有** Character、**没有**任何被 TS mixin 过的蓝图。而且：

- `WBP_Start` 在 TS 侧**没有对应模块**（`TypeScript/Blueprints/` 下只有 Ability / Character / Test，无 Widget）
- ~~`UGAS_GameInstance::CallTS` 全工程零调用~~ —— ⚠️ **此条已更正**：`CallTS` 在 **`Main_Map.umap`** 里有引用（用 `rg -a` 扫二进制资产才发现；我原先的 grep 用了 `--include=*.uasset`，**漏掉了 `.umap`**）。但它**不在 `Http_Map` 里**，所以下面这条结论不变。

所以 **`Http_Map` 完全不依赖 JsEnv**。热更流程（版本检查、下载、进度条、重启按钮）全程由蓝图驱动。

> 顺带一提：`Main_Map` 依赖 `CallTS` 这件事，**反而强化了「先 `RebuildScriptEnv()` 再 `OpenLevel`」的必要性** —— `Main_Map` 加载时 `FCall` 必须已由新的 `MainGame.ts` 重新绑定好，否则关卡蓝图调 `CallTS` 会打空。

#### 当前流程 vs 改造后

**当前**（`HotUpdateSubsystem.cpp:138-162`）：

```
Http_Map → StartCheckUpdate → 有新版本 → 下载 → 用户点「重启」
        → RestartGameApp()：CreateProc(自身) + RequestExit    ← 杀进程重启
        → 新进程 → Http_Map → 版本已一致 → OpenLevel(Main_Map)
```

**改造后**：

```
Http_Map → StartCheckUpdate → 有新版本 → 下载 → 全部校验通过
        → RebuildScriptEnv()          ← 重建 JS 虚拟机，加载新代码
        → OpenLevel(Main_Map)         ← 关卡切换，世界全新
        → Main_Map 的 Actor 逐个 BeginPlay → 跑的就是新代码 ✅
```

#### 为什么这个顺序是对的（**不能颠倒**）

| 顺序 | 结果 |
|---|---|
| ✅ `RebuildScriptEnv()` → `OpenLevel` | 新 JsEnv 先就位并完成 re-mixin；随后 `Main_Map` 的 Actor 才 `BeginPlay`，绑定的是新回调 |
| ❌ `OpenLevel` → `RebuildScriptEnv()` | `Main_Map` 的 Actor 会先用**旧** JsEnv `BeginPlay`、绑上旧回调；随后重建把它们全变成哑弹 → 技能/UI 全失效 |

#### 为什么这里没有「老对象失效」问题

§3.5 的局限成立的前提是「世界里有已绑定的老对象」。而 `Http_Map` 里**一个都没有**（上面已查证）。等 `OpenLevel` 到 `Main_Map` 时，世界是全新的，所有 Actor 都是新 JsEnv 下第一次 `BeginPlay`。

**换句话说：你不需要「软重启世界对象」，因为关卡切换本身就是最彻底的世界重建。**

#### 相比现有方案的实际收益

| 维度 | 现在（杀进程重启） | 改造后（重建脚本环境 + OpenLevel） |
|---|---|---|
| 耗时 | 整个引擎冷启动（数秒~数十秒） | 只重建 JsEnv + 加载关卡（亚秒级 + 关卡加载） |
| 失败面 | `CreateProc` 可能失败、命令行参数可能丢失、杀进程可能被系统拦截 | 无进程操作，失败面小得多 |
| PIE 兼容 | 需要 `#if WITH_EDITOR` 特判（现在就有，`HotUpdateSubsystem.cpp:142-150`） | **不需要特判**，PIE 里同样能跑 |
| 黑屏/闪烁 | 有（进程切换） | 无（只有一次关卡加载） |
| 「老对象失效」 | 不存在（进程都换了） | **同样不存在**（在启动器关卡里重建） |

> 这一条同时**消掉了 §六 的 R3b 风险**，并把阶段 0 的 Spike 重心从「验可行性」转为「验正确性」——具体保留/砍掉了哪些项，见 §四 阶段 0 的说明。

#### 实现要点（三个容易踩的坑）

**坑 1：`DefaultJSModuleLoader` 是被 `std::move` 消费掉的，不能复用**

`GAS_GameInstance.cpp:29-37`：

```cpp
auto ModuleLoader = std::make_unique<puerts::DefaultJSModuleLoader>(ScriptRoot);
...
GameScript = MakeShared<puerts::FJsEnv>(std::move(ModuleLoader), Logger, 8080);
//                                      ^^^^^^^^^^^^^^^^^^^ 这里已经移走了
```

所以 `RebuildScriptEnv()` 里**必须重新 new 一个 loader**，不能传原来的。

**坑 2：`Start` 的入口名要一并改掉**

现在是 `Start(TEXT("bundle"), Arguments)`（`GAS_GameInstance.cpp:57`）—— 注释写的是 `MainGame` 但代码是 `bundle`，**注释与代码不符**。模块化改造后入口应为 `"MainGame"`。重建函数里要用同一个名字。

**坑 3：`bDebugMode` / `bWaitForDebugger` 与 `Arguments` 要原样带上**

否则重建后调试端口丢失、`argv.getByName("GameInstance")` 拿到 null（`MainGame.ts:21` 会直接崩）。

#### 建议的函数签名

```cpp
// 幂等：不存在则创建，已存在则重建。Init() 和蓝图都调它。
UFUNCTION(BlueprintCallable, Category="HotUpdate")
void RebuildScriptEnv();
```

做成 `BlueprintCallable` 后，`Http_Map` 的关卡蓝图里在 `OnUpdateFinished` 之后、`OpenLevel` 之前插一个节点即可 —— **蓝图侧改动只有一个节点**。

---

## 四、分阶段执行

### 阶段 0：前置验证 Spike（**必须先做，2–3 天**）

**目的**：在投入改造前，用最小代价验证四个假设。**任何一条不成立，方案要重新设计。**

| # | 验证项 | 方法 | 通过标准 |
|---|---|---|---|
| 0.1 | `tsc` 散装产物能否被 Puerts 直接加载 | 把 `Start("bundle")` 临时改成 `Start("MainGame")`，`Content/JavaScript/` 保留散装 js（先不删 bundle.js），跑 PIE | 游戏正常启动，技能可用 |
| 0.2 | `RebuildScriptEnv()` 在 `Http_Map` 中调用是否安全 | 在 `Http_Map` 的关卡蓝图里，`OnUpdateFinished` 后调 `RebuildScriptEnv()`，再 `OpenLevel(Main_Map)` | 无崩溃；进入 `Main_Map` 后技能/UI 全部正常，且跑的是新代码 |
| 0.3 | 重建后 mixin 是否正确重绑定 | 故意改一段可观测的 TS 逻辑（如某个技能的伤害数字/打印），走完整热更流程 | 新逻辑生效，且**没有**「半新半旧」现象 |
| 0.4 | 反复热更是否有残留 | 连续热更 3~5 次，每次观察 `ORPHANED_DATA_ONLY_*` 类数量与内存 | 无线性增长、无崩溃 |

**交付物**：Spike 结论报告（通过/不通过 + 实测日志）

> ✅ **原 0.2「中途 Reset 是否安全」已被 §3.6 的查证消解**：热更发生在纯启动器关卡 `Http_Map`（无任何 TS 绑定的世界对象），不存在「技能飞行中」这类场景。风险面大幅收窄，Spike 从「验可行性」降级为「验正确性」。
>
> 如果将来要做**运行中热更**（不切关卡），那才需要重新引入「中途 Reset」的验证。

### 阶段 1：构建链改造（2–3 天）

| 任务 | 交付物 |
|---|---|
| 拆分构建产物目录，划清 include/exclude | `TypeScript/build.js` 改造 |
| 入口从 `bundle` 切到 `MainGame` | `GAS_GameInstance.cpp` 改动 |
| 保留 esbuild 做 TS→JS 转换 + 产出 `metafile` 作为依赖图 | 构建脚本 |
| （可选）加 minify | 同上 |

> **注意**：阶段 1 完成后，**热更还没做**，只是把「单文件」变成「多文件」。这一步可以独立验证、独立回滚。

### 阶段 2：服务端清单与发布脚本（2–3 天）

| 任务 | 交付物 |
|---|---|
| 清单生成器（已在原型中验证） | `tools/hotupdate/gen-manifest.mjs` |
| 差异比对 + 反向依赖闭包 | 同上，产出 `delta.json` |
| 发布目录组织 + 上传脚本 | `tools/hotupdate/publish.mjs` |
| 服务端目录初始化 | `update/` 目录结构 + `version.json` |

### 阶段 3：客户端热更运行时（4–6 天）

| 任务 | 交付物 |
|---|---|
| C++ 侧：清单拉取 / 下载 / 校验 / 落盘 / 回退 | `UHotUpdateSubsystem` 扩展 |
| C++ 侧：`RebuildScriptEnv()`（幂等、`BlueprintCallable`），入口名 `bundle` → `MainGame` | `GAS_GameInstance` 改动 |
| 蓝图侧：`Http_Map` 关卡蓝图在 `OpenLevel` 前插入 `RebuildScriptEnv` 节点 | **单节点改动**（见 §3.6） |
| TS 侧：可重入引导改造（重建后 UI 不叠层） | `MainGame.ts` + `BP_PlayerController.ts` 等 |
| UI：进度、失败提示、「更新完成，进入游戏」 | `WBP_Start` 改造（文案 + 按钮行为） |
| 启动自检 + 自动回退 | 启动标记机制 |

### 阶段 4：路线 B 可选增强（3–5 天，视需要）

模块级热替换 + 覆盖式 `mixin.ts`。**建议放到路线 A 稳定运行之后再评估**。

### 阶段 5：联调与灰度（2–3 天）

真机打包验证、弱网/断网/半途中断、回滚演练。

---

## 五、资源需求

| 项 | 说明 |
|---|---|
| **人力** | 1 名熟悉 UE C++ + TS 的开发者，约 **14–20 人天**（含 Spike 与联调；§3.6 用「重建脚本环境 + `OpenLevel`」替换掉整套进程重启逻辑，工作量较 v2 下调；但新增了心跳/黑名单/签名验签三处，总体相抵） |
| **环境** | 现有 Windows 开发机即可；需要一个可上传静态文件的 HTTP 服务（现有 `http://47.108.48.47` 可复用） |
| **软件** | 无新增依赖（Node 已有；脚本用 Node 内置 `crypto` 即可，原型已验证） |
| **存储** | 服务端每版本全量 ≈ 95KB（未压缩，**不含 `.map`**）。100 个版本 ≈ 10MB，可忽略。⚠️ 若不排除 `.map`，会多出约 58KB/版本（§2 问题 10 补充） |
| **带宽** | 单次增量典型 1–5 个文件 ≈ 3–15KB。相比现在每次全量 60KB，**流量下降一个数量级** |

---

## 六、风险与应对

| # | 风险 | 等级 | 应对 |
|---|---|---|---|
| **R1** | 软重启时正在执行的 JS 回调（AbilityTask / 定时器）导致崩溃 | **中**（原判「高」，下调） | 事实 7 已证实拆卸路径在 `Shutdown()` 里每天真实执行；且 §3.6 已查证热更只发生在纯启动器关卡 `Http_Map`，**不存在「技能飞行中」场景**。若将来做运行中热更，此风险重新升高 |
| **R1b** | **`Content/` 不可写导致热更失败** | **高（若上移动端/主机）** | 见 §1.3；Windows 打包版可写、现方案可用；移动端必须改自定义 `IJSModuleLoader`。**上线前需明确目标平台** |
| **R2** | 事实 6 的原型残留导致「半新半旧」 | **高** | 路线 A 天然规避；路线 B 必须改造 `mixin.ts` 为覆盖式 |
| **R3** | 软重启后多播委托重复绑定 | **中**（原判「中高」，收窄后下调） | **`FCall` 不会累积** —— 它是 `DECLARE_DYNAMIC_DELEGATE_TwoParams`（**单播**），`Bind` 是替换语义。真正会累积的是多播（`MontageTask.OnCompleted.Add(...)` 等），但它们多数挂在**每次技能激活新建**的 AbilityTask 上，随任务销毁而消失。风险集中在**长生命周期世界对象**（如 `BP_LaserActor`）—— 但 §3.6 的启动器关卡里没有这类对象。**应对：软重启与关卡重载绑定做** |
| ~~R3b~~ | ~~软重启后世界老对象的 TS 行为静默失效~~ | **已消除** | 见 §3.6：热更发生在纯启动器关卡 `Http_Map`（无任何 TS 绑定的世界对象），随后 `OpenLevel` 到 `Main_Map` 是全新世界，不存在老对象 |
| **R4** | 更新中途失败留下不一致状态 | 中 | staging 目录 + 全部校验通过再落地 + backup 回退 |
| **R5** | **新脚本有问题时「静默失效」**（不是崩溃） | **高**（原判「中高」，且原描述有误） | ⚠️ `Start()` 用 `TryCatch` 吞掉 JS 异常且无条件置 `Started = true`（`JsEnvImpl.cpp:3546-3554`）—— **不崩、不报错、C++ 侧无从判断**。应对：**脚本就绪心跳 + 超时**（§2 问题 6）；启动标记 + 自动回退；失败版本黑名单；`minBaseVersion` 兜底 |
| **R6** | 老客户端拿到新格式 `version.json` 把 JSON 当 bundle 下载 | 中 | 换新 URL（如 `/update/v2/version.json`）而非复用旧字段；或在服务端做版本分流 |
| **R7** | **明文 HTTP 下清单/代码可被中间人篡改 → 远程代码执行** | **高**（原判「中」，上调） | ⚠️ 当前 `Http_Map.umap` 里硬编码的是 `http://47.108.48.47/update/version.json`（**明文**）。下载即执行 = 谁劫持了响应谁就能在玩家机器上跑任意代码。**HTTPS + `manifest.json` 签名验签（客户端内置公钥）必须作为上线门槛，不是可选增强** |
| **R8** | 模块路径泄露内部结构 | 低 | 玩家 UI 只显示粗粒度进度，模块明细仅走日志。**注意：`.map` 泄露的是完整 TS 源码，比路径泄露严重得多**，发布构建必须排除（§2 问题 10 补充） |
| ~~R9~~ | ~~热更后 TS 层状态重置，玩家感知突兀~~ | **已消解** | 更新只发生在启动器关卡 `Http_Map`，玩家**还没进入游戏**（§3.6）—— 不存在「战斗中被重置」的感知问题 |
| **R10** | `ORPHANED_DATA_ONLY_*` 临时类累积 | 低 | **两条路线都会产生**（路线 A 走 `~FJsEnvImpl` → `Restore()`，路线 B 走 `Restore()` 后重 mixin），非路线 B 专属。控制热更频率；监控对象数 |

---

## 七、参考资料

### 官方文档（已逐条打开原文核实）

1. **PuerTS 官方文档 · 蓝图 Mixin** — `blueprint.mixin` / `MixinConfig{objectTakeByNative, inherit, generatedClass}` 的权威说明；含「覆盖 UE 事件需类中存在对应事件」的注意事项（引用 issue #1762）
   https://puerts.github.io/docs/puerts/unreal/mixin/
2. **PuerTS 官方文档 · FAQ** — 「手机/PC打包后脚本不执行」条目明确说明：JS 不是 UE 资产，需在「项目设置/打包/Additional Not-Asset Directories to Package」添加 `Content/JavaScript`；同页给出长期可用 TS 版本 3.4.5 / 4.4.4 / 4.7.4（本工程用 4.7.4）
   https://puerts.github.io/docs/puerts/unreal/faq/
   > ⚠️ **注意别照抄 FAQ**：FAQ 让勾的是 **"Additional Non-Asset Directories to Package"**，对应的是 `DirectoriesToAlwaysStageAsUFS`（**打进 pak**）。本工程配的是 **`DirectoriesToAlwaysStageAsNonUFS`**（显示名 "Additional Non-Asset Directories **To Copy**"，**散文件**）—— 两者是**不同的设置项**。本工程需要的是后者（散文件才能在打包后被替换）。详见下方第 6 条。
3. ~~**esbuild 官方文档 · External**~~ —— **本条已删除，引用不成立**。实测在本工程上跑 `bundle: false` + `--external:ue` 直接报错：
   ```
   X [ERROR] Cannot use "external" without "bundle"
   ```
   好消息是**根本不需要它**：非 bundle 模式下 esbuild 本来就原样保留 `require("ue")` 这类导入，`external` 是多余的。**保留此条只会误导实施者去踩一个必然报错的配置。**
4. **esbuild 官方文档 · Metafile** — 给出 `Metafile` 接口定义：`outputs[path].imports[]` 含 `path` / `kind` / `external?`，可作为模块依赖图的权威来源
   https://esbuild.github.io/api/#metafile
   > ⚠️ **归一化提醒**：metafile 里的 import path 是**相对每个文件**的（如 `./Blueprints/Test/BP_Test`），不是相对项目根。清单生成器必须自行解析归一化为逻辑路径，否则依赖图是错的。**本计划书的原型脚本走的是另一条路**——直接正则扫产物里的 `require("./...")` 再 `path.resolve`（`gen-manifest.mjs:53-64`），同样需要处理 `.js` 后缀补全。
5. **esbuild 官方文档 · Bundle** — `bundle` 关闭时不做合并；`platform: node` 与 `format: cjs` 的配合
   https://esbuild.github.io/api/#bundle
6. **UE 5.6 引擎源码 · ProjectPackagingSettings.h:605-619** — 两个打包设置项的**精确语义**（很多中文资料把它俩说反）：
   - `DirectoriesToAlwaysStageAsUFS`，编辑器显示名 **"Additional Non-Asset Directories to Package"** → **打进 pak**
   - `DirectoriesToAlwaysStageAsNonUFS`，编辑器显示名 **"Additional Non-Asset Directories To Copy"** → **散文件，不进 pak**
   两者 `Path` 均相对项目 `Content/` 目录。官方 FAQ 让勾的是**前者**，本工程 `Config/DefaultGame.ini:102` 配的是**后者**（散文件）—— 这恰好是「打包后还能替换 JS」所需要的那一个。
   `K:\Epic Games\UE_5.6\Engine\Source\Developer\DeveloperToolSettings\Classes\Settings\ProjectPackagingSettings.h`

### 官方 Issue（一手证据，均已打开原文核实）

> 这四条共同说明：**Inspector 那条热更链路不适合作为生产方案**，本计划书因此把路线 A（软重启）列为生产推荐。

| Issue | 状态 | 与本方案的关系 |
|---|---|---|
| [#115 热更新](https://github.com/Tencent/puerts/issues/115) | open | 作者 chexiongsheng 原话：「开启inspector功能就能用。**不过发布到外面的游戏一般不建议开启。**」 |
| [#1281 移动端热更 js 文件失败](https://github.com/Tencent/puerts/issues/1281) | closed | Android + UE 4.27.2：`await sendCommand("Runtime.enable", {})` 永不返回 |
| [#1286 运行时热更失败](https://github.com/Tencent/puerts/issues/1286) | closed | 官方解法：移动端 `PrivateDefinitions.Add("WITH_INSPECTOR")`；提问者描述的正是「拷补丁到 Saved → 重开地图 → 脚本不重载」这一场景 |
| [#2000 Shipping 模式 v8-hot-reload-kit 崩溃](https://github.com/Tencent/puerts/issues/2000) | open | **同款 PuerTS 1.0.5**、UE 5.1、Shipping/LTO/O2 下内存访问违例 `0x...D0` |
| [#1245 运行时挂载 pak，JS 不生效](https://github.com/Tencent/puerts/issues/1245) | closed | 官方：自定义加载来源请实现 `IJSModuleLoader`；pak 须在 JsEnv 启动前挂载 |
| [#1273 热更失败：scriptId 只有 puerts 目录下模块](https://github.com/Tencent/puerts/issues/1273) | closed | 提问者结论：应走 `IPuertsModule::Get().ReloadModule(...)`，而非自己 `new FJsEnv` |

补充：官方 org 下有一个开发期工具 **`v8-hot-reload-kit`**（npm 最新 `0.0.19`，2025-06-11），基于同一套 Inspector 协议做远程热刷，README 明言「真机默认不开启远程调试功能，需要手动开启」。**它是开发期工具，不是发布方案。**

### 关于插件版本号的一个坑

本工程 `Plugins/Puerts/Puerts.uplugin` 里 `VersionName` 是 `1.0.5`，但**这个字段官方长期没有更新，不能用来判断版本**。官方在 issue 里亲口承认过这点（有人据此误以为用的是 1.0.5）。PuerTS 面向 Unreal 的**最新 Release 是 `Unreal_v1.0.9`（2025-07-15，内容为 UE 5.6.0 兼容）**。本工程当前按 UE 5.3 使用，升级前需评估。
- Releases 列表：https://github.com/Tencent/puerts/releases
- Unreal_v1.0.9：https://github.com/Tencent/puerts/releases/tag/Unreal_v1.0.9

### 源码级依据（本仓库，可逐条复核）

**文档收录情况**（已把 `doc/unreal/zhcn/` 下全部文档拉下来做过全文检索）：

| API | 官方文档 | 备注 |
|---|---|---|
| `blueprint.tojs` / `blueprint.mixin` | ✅ **有**（`doc/unreal/zhcn/mixin.md`） | 但插件 `.d.ts` 里的 `MixinConfig` 比文档多一个 `noMixinedWarning` 字段，文档未同步 |
| `blueprint.unmixin` | ❌ 无 | 只在 `Typing/puerts/index.d.ts:58` 有类型声明；实现是 JS（`uelazyload.js:241-245`），语义是「空方法表 + 第 6 参为 `true` 再调一次 mixin」 |
| `puerts.forceReload` / `getModuleByUrl` | ❌ 无 | 实现在 `modular.js:205` / `:222` |
| `HMR.prepare` / `HMR.finish` | ❌ 无 | 只在 `hot_reload.js:88,90` 出现；**Puerts 自身没有任何监听者**，是留给业务方做「热更前保存状态 / 热更后恢复」的钩子 |
| `FJsEnv::ReloadModule` / `ReloadSource` / `OnSourceLoaded` | ❌ 无 | Unreal 侧文档全无，只能读 `JsEnv.h:46-50` |

以下事实以源码为准：

| 事实 | 位置 |
|---|---|
| V8 Inspector 平台门控（**非**「仅编辑器」） | `Plugins/Puerts/Source/JsEnv/Private/V8InspectorImpl.cpp:17`（真门控）vs `:611`（过期注释） |
| `WITHOUT_INSPECTOR` 仅在 QuickJS 后端定义 | `Plugins/Puerts/Source/JsEnv/JsEnv.Build.cs:620`（本工程 V8 后端，未定义） |
| `Inspector` 创建点 | `Plugins/Puerts/Source/JsEnv/Private/JsEnvImpl.cpp:620` |
| 二次 mixin 抛 `"had mixin"` | `JsEnvImpl.cpp:4369` |
| unmixin 释放路径 | `JsEnvImpl.cpp:4362-4366` / `uelazyload.js:245` |
| `blueprint.mixin` 原型守卫 | `Plugins/Puerts/Content/JavaScript/puerts/uelazyload.js:221-231` |
| JS 类包装按类型缓存 | `JsEnvImpl.cpp:3149`（`GetJsClass`）+ `3030`（`TypeReflectionMap`） |
| 析构自动 Restore 全部 mixin | `JsEnvImpl.cpp:899-906` |
| `Start` 只能调一次 | `JsEnvImpl.cpp:3494` |
| 析构清理委托代理 | `JsEnvImpl.cpp:788-800` |
| 委托代理持 `TWeakPtr` | `Plugins/Puerts/Source/JsEnv/Private/DynamicDelegateProxy.h:38` |
| CJS 包装 | `Plugins/Puerts/Content/JavaScript/puerts/modular.js:62` |
| `moduleCache` / `forceReload` | `modular.js:52` / `modular.js:205` |
| 模块按文件系统解析（先调用方目录 → 逐级向上 → 回落 `ScriptRoot` → **再回落 `Content/JavaScript`**） | `Plugins/Puerts/Source/JsEnv/Private/DefaultJSModuleLoader.cpp:96-120` |
| `CheckExists` 走 `IPlatformFile`（散文件与 pak 内文件均可命中） | `DefaultJSModuleLoader.cpp:53-63` |
| `FJsEnv` 非 `TSharedFromThis`（内部无法强引用自身） | `Plugins/Puerts/Source/JsEnv/Public/JsEnv.h:63` |
| `IJsEnv` 析构为虚函数 | `JsEnv.h:60-62` |
| 现有 `Shutdown()` 已在调 `GameScript.Reset()`（拆卸路径已实测） | `Source/PTGAS/Private/GameInstance/GAS_GameInstance.cpp:66-71` |
| `DefaultJSModuleLoader` 被 `std::move` 消费，重建时必须新建 | `GAS_GameInstance.cpp:29-37`、`:49` |
| `Restore` 完整还原原函数（Script / NativeFunc / FunctionFlags）并把 JS 函数移到 orphan 类 —— **证明「restore → re-mixin」是可重复的干净循环** | `JSGeneratedClass.cpp:273-330` |
| `Http_Map` 是纯启动器关卡（仅引用 `WBP_Start` + `/Script/PTGAS` + `Main_Map`） | `Content/Maps/Http_Map.umap`（资产字符串扫描，未压缩可读） |
| ~~`CallTS` 全工程零调用~~ | ⚠️ **本条已更正（2026-09-24）**：定义在 `GAS_GameInstance.h:46` / `.cpp:74`；调用点在 **`Content/Maps/Main_Map.umap`**（关卡蓝图经 GameInstance 调用）。我原先用 `grep -rl CallTS Content --include=*.uasset`，**`--include` 把 `.umap` 过滤掉了** —— 教训：**验证 UE 资产引用必须用 `rg -a` 覆盖全部资产类型**。`Http_Map` 确实无引用（已扫），§3.6 的结论不受影响 |
| 现有「重启」是杀进程重启 | `HotUpdateSubsystem.cpp:138-162`（`CreateProc` + `RequestExit`，含 PIE 特判） |
| `WBP_Start` 内含 `ProgressBar` 与 `RestartGameApp` 按钮 | `Content/BluePrints/Widget/WBP_Start.uasset` |
| `Restore` 创建 ORPHANED 类 | `Plugins/Puerts/Source/JsEnv/Private/JSGeneratedClass.cpp:273-278` |
| 字节码缓存默认关闭 | `Plugins/Puerts/Source/JsEnv/JsEnv.Build.cs:54` |
| `ReloadModule` 先按模块名反查磁盘路径，搜不到即报 `not find js module` | `JsEnvImpl.cpp:1476`（`JsHotReload`）/ `:1512` |
| `ReloadSource` 跳过模块名查找，直接按路径重载 | `JsEnvImpl.cpp:1524` |
| 编辑器侧的自动热重载（**可参考，但仅编辑器**） | `PuertsEditorModule.cpp:122-150`（`OnSourceLoaded` 接到文件监听）+ `SourceFileWatcher.cpp:52-90`（仅 `.js`、仅 `FCA_Modified`、MD5 变化才触发） |
| `hot_reload.js` 依赖 `Debugger.scriptParsed` 事件建立 url→scriptId 映射，找不到就放弃 | `Plugins/Puerts/Content/JavaScript/puerts/hot_reload.js` |
| 模块散文件与 pak 内文件都能被加载（走 `IPlatformFile`） | `DefaultJSModuleLoader.cpp:53-63`（`CheckExists`） |

### 实测数据（本计划书生成过程中跑出）

- 模块总数 **31**（`Blueprints/` 28 + `Gen/` 1 + `MainGame.js` + `mixin.js`）
- 全量 **94,927 字节**，单模块均值 ≈ 3,025 字节
- 模拟增量：下载集 **3** / 重载集 **9**
- 依赖热点：`mixin.js` 被 **28** 个模块依赖；`BP_GameplayAbility.js` 被 **6** 个依赖

---

## 八、待确认事项

以下几处需要你拍板，会影响后续设计：

> 📌 外部复核方对下面六条**各自给了一个建议答案**，见 **§9.5**。我的意见与之一致，可直接参考着拍板。

1. **目标平台到底是什么？**（**新增，优先级最高**）只发 Windows，还是将来要上移动端/主机？这直接决定 §3.2 的落盘策略：Windows 走「覆盖写 `Content/`」，移动端必须走自定义 `IJSModuleLoader`。**这一条不定，架构就不能冻结。**
2. **路线 A 还是 A+B？** 我建议先只做 A，B 作为开发期工具后置。
3. ~~**生效时机**~~ → **已定：绑在 `Http_Map → Main_Map` 的关卡切换上**（§3.6 已查证可行）。唯一待你确认的是：`WBP_Start` 上那个「重启」按钮的**文案要不要改**（不再是重启，而是「进入游戏」）
4. **服务端 URL 策略**：复用现有 `http://47.108.48.47/update/` 还是新开路径？老客户端的兼容处理怎么做？
5. **是否需要签名**：只上 HTTPS，还是要对 manifest 做签名验签？
6. **玩家可见粒度**：进度条即可，还是需要显示「更新了哪些内容」？

---

## 九、外部复核结论（2026-09-24 修订附录）

> **复核方式（如实说明）**：本次复核逐条打开了本仓库源码，核对计划书引用的 Puerts / 工程源码论断；对 `.umap` / `.uasset` 二进制资产使用 `rg -a` 扫描（纯文本 `grep` 会漏报，见 §9.3 勘误 4）；并在本工程 31 个业务 TS 文件上**实测**了 esbuild `bundle:false + metafile` 的工作方式；实测复算了模块数 / 字节数 / 依赖数（与计划书完全一致）。
> **未能独立验证**：`K:\Epic Games\UE_5.6` 引擎源码在仓库之外，§七 引用的 `ProjectPackagingSettings.h` 行号未逐一打开核对（但本工程 `DefaultGame.ini` 的 NonUFS 配置与其声称的语义一致）；外部 issue / 文档链接未联网复核。

**总体结论**：计划书的源码级技术底座**全部经得起逐条复核**，路线 A + 关卡切换生效的架构判断正确。但存在 **2 个高危缺口、4 个中危缺口**，建议在进入阶段 0 Spike 前先把 §9.2 / §9.3 的修订吸收进正文。

### 9.1 复核通过项（抽查全部属实）

以下论断均已在源码中逐条核实，无需修改：

| 论断 | 复核结果 |
|---|---|
| Inspector 真门控在 `V8InspectorImpl.cpp:17`，`:611` 注释过期 | ✅ 属实 |
| `WITHOUT_INSPECTOR` 仅在 QuickJS 后端（`ThirdPartyQJS`）定义，本工程走 V8 | ✅ 属实 |
| `DefaultJSModuleLoader::Search` 的解析顺序：先调用方目录 → 逐级向上 → 回落 `ScriptRoot` → 再回落 `Content/JavaScript` | ✅ 属实（§1.3 的「遮蔽失效」分析成立） |
| `moduleCache` / `forceReload` / `localModuleCache` 三者语义 | ✅ 属实 |
| 二次 mixin 抛 `"had mixin"`；`unmixin` 走 `Info[5] == true` 分支 | ✅ 属实 |
| `blueprint.mixin` 的 `hasOwnProperty` 守卫 + `TypeReflectionMap` 类缓存 → 「半新半旧」 | ✅ 属实 |
| `~FJsEnvImpl` 自动 Restore 全部 mixin；`Reset()` 经 `unique_ptr<IJsEnv>` 虚析构确实触发析构 | ✅ 属实 |
| `FJsEnvImpl::Start` 只能调用一次 | ✅ 属实 |
| 委托代理持 `TWeakPtr`，析构后残留委托为安全 no-op | ✅ 属实 |
| `hot_reload.js` 里 `forceReload` 被注释；`setScriptSource` 不重执行模块体 | ✅ 属实 |
| `GAS_GameInstance` 现状（`ScriptRoot="JavaScript"`、`Start("bundle")` 与注释不符、`Shutdown()` 已调 `Reset()`） | ✅ 属实 |
| `Http_Map` 仅引用 `WBP_Start` + `Main_Map` + `/Script/PTGAS`，无任何 TS mixin 的世界对象 | ✅ 属实（`.umap` 二进制扫描） |
| 现有重启是 `CreateProc` + `RequestExit` 杀进程 | ✅ 属实 |
| 实测数据：31 模块 / 94,927 字节 / `mixin.js`×28 / `BP_GameplayAbility.js`×6 / `bundle.js` 59,729 字节 | ✅ 复算完全一致 |
| 业务模块无动态 `require`（全部为字符串字面量） | ✅ 属实 |
| 业务模块**无循环依赖**（用 esbuild metafile 实算依赖图，31 节点 0 环） | ✅ 属实（反向依赖闭包方案在本工程成立） |
| esbuild `bundle:false + metafile` 可产出每文件的 `imports[]`（相对路径、`external:true`） | ✅ 已在本工程 31 个 TS 上实测通过 |

### 9.2 必须修正的高危问题 ⚠️

#### 高危 1：R7 严重低估安全风险 —— 明文 HTTP + 无签名 = 可被劫持的远程代码执行通道

已在 `Content/Maps/Http_Map.umap` 中扫出实际 URL：`http://47.108.48.47/update/version.json`（**明文 HTTP**）。
本方案的 manifest 哈希（sha256）只能防**传输损坏 / 磁盘损坏**，防不了**同时控制 manifest 与文件的网络攻击者** —— 而明文 HTTP 上的中间人恰好就是这样的位置。这套管线下载的是**要执行的 JS 代码**，风险等级应从「中」上调为「**高（对外发布）**」。

**修订要求**：
- 对外发布（任何非内网环境）：**HTTPS + manifest 签名（客户端内置公钥验签）为上线门槛**，不是「进一步可做」的增强项；
- 仅内网测试可暂用 HTTP，但需在文档中明示「不得用于发布」。

#### 高危 2：回滚设计存在「无限重试循环」，且启动标记的检查时机未定义

§3.4 的回滚流程存在经典死循环：回滚后本地版本 ≠ 远端版本 → 下次启动重新下载**同一个坏版本** → 再次失败 → 再次回滚 → 循环。

同时，计划书未写明**启动标记在哪里检查**。标记必须在 `UGAS_GameInstance::Init()` 中、`GameScript->Start()` **之前**检查并回滚 —— 否则坏 JS 会先被启动，回滚逻辑本身可能没机会执行（若只在 `Http_Map` 蓝图里检查，则坏代码在 `Init()` 里就已经跑过了）。

**修订要求**：
1. 本地持久化「失败版本黑名单」：回滚发生时记录该版本号，下次启动跳过该版本的自动更新（或重试 N 次后转人工确认 / 维护提示），直到服务端版本号变化；
2. 明确写入 §3.4：标记检查位于 `Init()` 内、FJsEnv 创建与 `Start` 之前；
3. 「成功」的定义要收窄（见中危 3）。

### 9.3 建议修正的中危问题

#### 中危 3：`Start()` 会吞掉 JS 异常 —— 「新脚本启动即崩」的假设不准确，Rebuild 后无法感知初始化失败

复核 `FJsEnvImpl::Start`：入口 require 被 `v8::TryCatch` 包住，**异常只打日志，`Started` 照样置 true，函数返回 void**。也就是说：

- 语法错误 / 运行时错误的新 JS **不会崩进程**，只会让 TS 静默死掉或半初始化；
- `RebuildScriptEnv()` 成功返回 ≠ 新代码活着，C++ 侧无任何返回值可查；
- 按现有流程会继续 `OpenLevel(Main_Map)`，玩家进入一个 TS 全灭的关卡（黑屏 / 技能全失效）。

**修订要求**：增加「脚本就绪心跳」机制。建议 `MainGame.ts` 初始化末尾调用一个 `BlueprintCallable` 的 `NotifyScriptReady()`；`Http_Map` 等到心跳（带超时）再 `OpenLevel`；超时则**就地回滚 + 重建脚本环境**（或进入错误提示页）。同时把阶段 0.2 Spike 的通过标准从「无崩溃」改为「心跳按时到达且技能/UI 正常」。

#### 中危 4：勘误 —— 「CallTS 全工程零调用」与事实不符

计划书 §七 声称 `CallTS` 全工程零调用，其 grep 方法漏掉了**二进制资产**。用 `rg -a` 复核：`Content/Maps/Main_Map.umap` 中明确存在 `CallTS`、`GAS_GameInstance`、`GAS_GameInstance_C` 引用 —— **Main_Map 的关卡蓝图在通过 GameInstance 调 CallTS**。

对结论的影响：
- `Http_Map` 本身确实**没有** CallTS 引用（已扫），§3.6「Http_Map 不依赖 JsEnv」的结论**依然成立**；
- 但 Main_Map **依赖** JsEnv（经 `FCall` 回调 TS）—— 这恰好反过来印证了 §3.6「先 `RebuildScriptEnv()` 再 `OpenLevel`」顺序的必要性：Main_Map 加载时 FCall 必须已由新 MainGame 重新绑定；

**修订要求**：
1. 更正 §七 该行为「Main_Map 引用 CallTS（经 `rg -a` 扫描 `.umap` 确认），Http_Map 无引用」；
2. 在复核方法说明中注明：**验证二进制资产必须用 `rg -a`（或等效二进制扫描），纯文本 grep 会漏报**。

#### 中危 5：`Gen/GameplayTags.gen.js` 不能当普通热更内容

§3.2 把 `Gen/GameplayTags.gen.js` 列为热更对象，但该文件只是 `UE.GameplayTag` 的**包装层**；真正的 tag 注册表在 `Config/DefaultGameplayTags.ini` 中，**烘焙进底包**。JS-only 更新若引入新 tag / 改名 tag，会得到**未注册的空 tag**，GAS 的匹配与激活行为会直接坏掉。

**修订要求**：在 §3.2 注明「**tag 集合变更（新增 / 改名）= 底包更新**，JS 热更只能引用底包中已注册的 tag」；或增加启动时 tag 有效性自检（构造后校验 `TagName` 非空 / 已注册）。

#### 中危 6：sourcemap（`.map`）策略完全缺失

实测业务 `.js.map` 共 **37 个 / 303,175 字节**，是 JS 本体（94,927 字节）的 **3.2 倍**。`DirectoriesToAlwaysStageAsNonUFS` 会把整个 `Content/JavaScript` 目录打进包 —— **今天这些 map 就在随包下发给玩家**。§二问题 10 的 include/exclude 清单里没有提到它们。

> ⚠️ **本节数字已被复核修正**：同口径实为 **31 个 / 57,993 字节 / 0.61 倍**（上表的 37 个/303,175 混入了 `bundle.js.map` 与 `PuertsEditor/` 的 map）。**修订要求不变，量级以 §9.6 为准** —— 保留原文以便追溯。

**修订要求**：
- 发布构建排除 `.map`（从打包与热更清单两边都排除），或仅在 dev 构建保留；
- 否则「每版本 ≈ 95KB」的存储估算实际会变成 ~400KB（**同口径修正值：~153KB**），且**完整 TS 源码结构泄露给玩家**（比 R8 说的「模块路径泄露」严重得多）；
- 构建脚本需显式决定 sourcemap 输出目录（不要与发布产物混放）。

### 9.4 低危与细节修正

| # | 问题 | 修订 |
|---|---|---|
| 1 | **esbuild External 引用不成立**：实测 `--external:ue` 在 `bundle:false` 下直接报错 `Cannot use "external" without "bundle"`。好消息：非 bundle 模式下 import 本来就原样保留，**根本不需要 external** | 删除 §七第 3 条 External「官方依据」，只保留 Metafile 依据。注意 metafile 的 import path 是**相对每个文件**的路径（如 `./Blueprints/Test/BP_Test`），清单生成器需自行归一化为逻辑路径 |
| 2 | esbuild 产物风格与现有 tsc 输出不同（`__decorateClass` 辅助、`0 && (module.exports = {...})` 注释、`\u` 转义字符串）—— 均为合法 CJS，Puerts 可正常加载，但**首次切换构建链会导致所有模块 hash 变化 = 一次性全量重下** | 写入阶段 1 的预期与发布流程（首个版本号应整体跳版） |
| 3 | §3.4「一举解决篡改 / 损坏 / 删除」言过其实：哈希全量校验**只在版本号不一致时**执行；版本一致但本地文件被改坏时检测不到 | 95KB 规模下每次启动全量校验成本约等于零，建议**每次启动都验**（或至少验入口模块 `MainGame.js`） |
| 4 | R10 把 `ORPHANED_DATA_ONLY_*` 累积归为「路线 B」专属，不准确：路线 A 的每次 `Reset()` 也会经析构 → `Restore` 为全部 28 个 mixin 类各创建一个临时类 | 如实改为「**两条路线都有**；均为 `RF_Transient`、受 GC 回收约束，属良性成本；热更频率仍建议控制」 |
| 5 | `minBaseVersion` 语义未定义：底包过旧时 JS 热更救不了，「强制全量重下」也没用（重下的还是 JS，不是底包） | 唯一安全动作：**阻止进游戏 + 提示安装新底包**；在 §3.3 中写明该字段语义与客户端行为 |
| 6 | 「模块化**无需重建构建链**」易被误读：现有散装 JS 来自手动 `tsc --watch`（package.json `start`），`build.js` 只有 esbuild 打包环节；阶段 1 本来就要改构建链 | 措辞改为「**无需改运行时，构建链改造量小**」 |
| 7 | 原型脚本未入库：`tools/hotupdate/` 目前不存在，「已用原型验证」的数字虽复算一致，但不可复现 | 将原型脚本随计划书一起提交入库 |

### 9.5 待确认事项的复核建议

对应 §八 的六条，复核后的建议答案：

1. **目标平台**：先 **Windows-only**（R1b 保持关注即可）；
2. **路线**：**只做 A**，B 后置为开发期工具；
3. **按钮文案**：改为「**进入游戏**」，并接入 §9.3 中危 3 的「就绪心跳」后再 `OpenLevel`；
4. **URL 策略**：**新开 `/update/v2/` 命名空间**，避免在途老客户端踩 R6；服务端按版本分流旧 `/update/`；
5. **签名**：对外发布 **HTTPS + manifest 签名必选**；内网测试可暂缓但须标注「不得用于发布」；
6. **玩家可见粒度**：进度条即可；模块明细走日志（R8 不变）。

以上六条拍板后，§三 的架构即可冻结，进入阶段 0 Spike。

---

### 9.6 对 §九 复核意见的再复核（我的独立验证）

> **复核意见同样需要被复核。** 我把 §九 的每一条论断都拿回源码/实测验证了一遍，结果如下。

#### ✅ 源码级论断：全部属实

| 复核条目 | 我的验证方式 | 结论 |
|---|---|---|
| 中危 3：`Start()` 吞异常 | 读 `JsEnvImpl.cpp:3546-3554` 原文 | ✅ **属实**。`TryCatch` 包住入口 require，异常只 `Logger->Error`；`Started = true` **无条件执行**，函数返回 `void`。**复核方的判断比原计划书准确** |
| 中危 4：`CallTS` 非零调用 | `rg -a` 扫 `.umap` 二进制 | ✅ **属实，且这是我的错**（见下方「我的方法学错误」） |
| 中危 5：tag 注册表在 `.ini` | 读 `Config/DefaultGameplayTags.ini`：`ImportTagsFromConfig=True` + `+GameplayTagList=(Tag="Ability.Dash",...)` | ✅ **属实**。注册表确实烘焙进底包，`Gen/GameplayTags.gen.js` 只是包装层 |
| 低危 1：`--external` 不成立 | 在本工程跑 esbuild 0.28.2 复现 | ✅ **属实**，复现出**完全一致**的报错：`X [ERROR] Cannot use "external" without "bundle"` |
| 低危 4：路线 A 也产生孤儿类 | 读 `JsEnvImpl.cpp:899-906` 析构 + `JSGeneratedClass.cpp:273-330` `Restore()` | ✅ **属实**。`~FJsEnvImpl` → 逐 mixin `Restore()` → 每次 rename 出一个 `ORPHANED_DATA_ONLY_%s`。**两条路线都会产生** |
| 低危 6：构建链现状 | 读 `package.json`（scripts 仅 `"start": "tsc --watch"`）；`bundle.js` 实测 59,729 字节 | ✅ **属实** |
| 9.1：业务模块无循环依赖 | **自己写了一个 DFS 环检测**跑 31 个模块 | ✅ **属实：31 节点，0 环**。反向依赖闭包方案成立 |

#### ❌ 唯一一条算错的：中危 6 的 sourcemap 量级（高估约 5 倍）

复核称「业务 `.js.map` 共 **37 个 / 303,175 字节**，是 JS 本体（94,927 字节）的 **3.2 倍**」。

我把这个数**反推出来了** —— 它是「`Content/JavaScript` 下全部 `.map` 减去 `Examples/`」（45 个共 330,710 字节，减掉 Examples 的 8 个 = 37 个 / 303,175 字节）。**分子里混进了两类不属于热更范围的东西**：

| 混入项 | 字节 | 为什么不该算 |
|---|---|---|
| `bundle.js.map` | 127,112 | 改造后 `bundle.js` 作废，它的 map 自然也不存在 |
| `PuertsEditor/**/*.map` | 114,337 | 编辑器专用，发布包里根本没有 |

**同口径对比**（31 个业务模块的 JS ↔ 它们各自的 map）：

| 项 | 字节 | 倍数 |
|---|---|---|
| 业务 JS 本体（31 个） | 94,927 | 1.00x |
| 对应 `.js.map`（31 个） | **57,993** | **0.61x** |

**结论（必须排除 `.map`）成立，但量级从 3.2 倍修正为 0.61 倍。** 相应地：

- §5 存储估算「~400KB/版本」应改为 **~153KB/版本**；
- 「完整 TS 源码泄露」这条**依然成立且依然严重** —— 0.61 倍也是实打实的源码。

> 这类错误很典型：**分子分母口径不一致**。复核方在同一个数字上犯了和我「`CallTS` 漏扫 `.umap`」同类的错 —— 都不是逻辑错，而是**统计范围没对齐**。两处都已在本版修正。

#### 我的方法学错误（记下来，避免再犯）

我用 `grep -rl "CallTS" Content --include=*.uasset` 得出「全工程零调用」，**`--include=*.uasset` 把 `.umap` 排除在外了**。关卡蓝图正是存在 `.umap` 里的。教训：

> **验证 UE 资产引用，必须用 `rg -a`（或等效二进制扫描）覆盖全部资产类型（`.uasset` + `.umap`），纯文本 grep 的 `--include` 过滤会静默漏报。**

复核方指出这点是对的，已按 §9.3-中危 4 的修订要求更正 §七。

#### 对 §九 的两点保留意见

1. **中危 6 的量级** —— 已如上修正。复核的修订要求（排除 `.map`）我**完全采纳**，只是数字要改对，否则会误导实施者去做过度的优化。
2. **§9.4 低危 3 的建议我做了部分保留** —— 复核建议「95KB 规模下每次启动全量校验成本约等于零，建议每次启动都验」。方向对，但**每次启动对 31 个文件算 sha256 在低端移动设备上并非零成本**（尤其冷启动 I/O）。折中方案已写入 §3.4：**版本号一致时至少验入口文件**，全量校验按启动成功与否/周期触发。**理由是「成本可忽略」这个前提在移动端不成立，而移动端恰恰是 R1b 标记的高风险平台。**

#### §九 中已被本版采纳并落地的条目

| 复核条目 | 落地位置 |
|---|---|
| 高危 1（R7 上调 + HTTPS/签名作门槛） | §六 R7（中→**高**）；§八 待确认第 5 条 |
| 高危 2（黑名单 + 标记时机） | §3.4 三个必须补上的细节 (2)(3) |
| 中危 3（心跳） | §2 问题 6 重写；§六 R5 重写 |
| 中危 4（CallTS 勘误） | §七 已更正；本条 §9.6 记录了方法学教训 |
| 中危 5（tag 边界） | §3.2 新增「热更边界」小节 |
| 中危 6（`.map`） | §2 问题 10 补充（**含修正后的数字**）；§五 存储行；§六 R8 |
| 低危 1（External） | §七 第 3 条已删除并标注原因 |
| 低危 3（校验时机） | §3.4 细节 (1)（**采用折中方案**） |
| 低危 4（R10 归属） | §六 R10 改为「两条路线都有」 |
| 低危 5（`minBaseVersion` 语义） | §3.3 新增完整定义 |
| 低危 7（原型脚本入库） | **待办**：`tools/hotupdate/` 尚未入库 |

#### 仍未完成的事项（如实列出）

1. **步骤 5 `codex exec`** —— 后端代理 `http://127.0.0.1:15721` 不可达（502），未执行；
2. **原型脚本入库** —— 脚本目前只在临时目录，需迁到 `tools/hotupdate/`（§9.4 低危 7）；
3. **阶段 0 Spike 未跑** —— 四条验证项都还是纸面结论。
