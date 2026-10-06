// Fill out your copyright notice in the Description page of Project Settings.

#include "GameInstance/GAS_GameInstance.h"
#include "HotUpdate/LiveJSModuleLoader.h" // 引用新建的 Loader

void UGAS_GameInstance::Init()
{
	Super::Init();
	
	// 启动脚本虚拟机
	StartGameScript();
}

void UGAS_GameInstance::StartGameScript()
{
	// 使用新建的 FLiveJSModuleLoader：
	// 它优先查找 Saved/HotUpdate/JavaScript/ 下的文件，找不到再回退到 Content/JavaScript/
	auto ModuleLoader = std::make_unique<FLiveJSModuleLoader>();
	auto Logger = std::make_shared<puerts::FDefaultLogger>();
	
	if (bDebugMode)
	{
		GameScript = MakeShared<puerts::FJsEnv>(
			std::move(ModuleLoader),
			Logger,
			8080
		);
		
		if (bWaitForDebugger)
		{
			GameScript->WaitDebugger();
		}
	}
	else
	{
		GameScript = MakeShared<puerts::FJsEnv>(
			std::move(ModuleLoader),
			Logger,
			-1
		);
	}
	
	// 传递 GameInstance 实例给 MainGame.ts
	TArray<TPair<FString, UObject*>> Arguments;
	Arguments.Add({TEXT("GameInstance"), this});
	
	// 启动 bundle 入口
	GameScript->Start(TEXT("bundle"), Arguments);
	
	UE_LOG(LogTemp, Warning, TEXT("[PTGAS] GameScript Started successfully with bundle.js."));
}

void UGAS_GameInstance::RestartJsEnv()
{
	UE_LOG(LogTemp, Warning, TEXT("[PTGAS] Restarting GameScript for Live HotUpdate..."));

	// 1. 先解绑 FCall，防止旧 TS 闭包持有悬空指针
	FCall.Unbind();

	// 2. 彻底销毁并释放旧的 V8 虚拟机实例
	if (GameScript.IsValid())
	{
		GameScript.Reset();
	}

	// 3. 强制进行一次引擎层完整的 GC，清空无用的原生绑定对象与原型
	GEngine->ForceGarbageCollection(true);

	// 4. 原地重建全新虚拟机，此时 ModuleLoader 会自动命中刚下载好的 Saved 热更文件，重新走一遍 bundle 和 @mixin
	StartGameScript();

	UE_LOG(LogTemp, Warning, TEXT("[PTGAS] GameScript Restart Completed!"));
}

void UGAS_GameInstance::OnStart()
{
	Super::OnStart();
}

void UGAS_GameInstance::Shutdown()
{
	Super::Shutdown();
	
	FCall.Unbind();
	GameScript.Reset();
}

void UGAS_GameInstance::CallTS(FString FunctionName, UObject* Uobject)
{
	FCall.ExecuteIfBound(FunctionName, Uobject);
}