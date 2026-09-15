// Fill out your copyright notice in the Description page of Project Settings.

#include "GameInstance/GAS_GameInstance.h"

void UGAS_GameInstance::Init()
{
	Super::Init();
	
	// 1. 获取打包后的绝对 Saved 路径并打印
	//FString SavedDir = FPaths::ConvertRelativePathToFull(FPaths::ProjectSavedDir());
	// 我们把热更目录直接定死在 Saved/JavaScript/
	//FString HotPatchDir = FPaths::Combine(SavedDir, TEXT("JavaScript/"));
	//FString TestFile = FPaths::Combine(HotPatchDir, TEXT("bundle.js"));

	// 2. 强行弹窗 + 强行打印日志
	//bool bExist = FPaths::FileExists(TestFile);
	//FString Msg = FString::Printf(TEXT("【热更调试】检查文件: %s \n 是否存在: %s"), *TestFile, bExist ? TEXT("YES (走热更)") : TEXT("NO (走底包)"));
	
	// 在屏幕左上角打印红字持续 10 秒
	//GEngine->AddOnScreenDebugMessage(-1, 10.f, FColor::Red, Msg);
	// 在 Log 文件里打印
	//UE_LOG(LogTemp, Warning, TEXT("%s"), *Msg);

	// 3. 决定最终给 Puerts 的根目录
	//FString ScriptRoot = bExist ? HotPatchDir : TEXT("JavaScript");
	
	FString ScriptRoot = TEXT("JavaScript");
	//DefaultJSModuleLoader，创建一个负责从指定目录加载JS模块的对象
	auto ModuleLoader = std::make_unique<puerts::DefaultJSModuleLoader>(ScriptRoot);
	//FDefaultLogger,Puerts默认日志器，JS端的console.log会输出到UE日志
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
		GameScript = MakeShared<puerts::FJsEnv>(std::move(ModuleLoader),Logger,-1);
	}
	
	//这里这个TEXT("GameInstance")的GameInstance必须和MainGame.ts中传递的参数名一致，否则在MainGame.ts中无法通过puerts.getGlobal("GameInstance")获取到这个实例
	TArray<TPair<FString, UObject*>> Arguments;
	Arguments.Add({TEXT("GameInstance"),this});
	
	//启动脚本，指定入口模块为“MainGame”，并传递参数
	GameScript->Start(TEXT("bundle"),Arguments);
	//这里的MainGame必须是TypeScript/MainGame.ts文件的名字，否则会找不到入口模块，导致脚本无法启动
}

void UGAS_GameInstance::OnStart()
{
	Super::OnStart();
}

void UGAS_GameInstance::Shutdown()
{
	Super::Shutdown();
	
	GameScript.Reset();
}


void UGAS_GameInstance::CallTS(FString FunctionName, UObject* Uobject)
{
	FCall.ExecuteIfBound(FunctionName, Uobject);
}
