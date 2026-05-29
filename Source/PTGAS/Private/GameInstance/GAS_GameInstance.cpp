// Fill out your copyright notice in the Description page of Project Settings.

#include "GameInstance/GAS_GameInstance.h"

void UGAS_GameInstance::Init()
{
	Super::Init();
	if (bDebugMode)
	{
		GameScript = MakeShared<puerts::FJsEnv>(
		std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")),//这里表示TS文件编译后的JS代码都放在JavaSript文件下
		std::make_shared<puerts::FDefaultLogger>(),
		8080
		);
		
		if (bWaitForDebugger)
		{
			GameScript->WaitDebugger();
		}
	}
	else
	{
		GameScript = MakeShared<puerts::FJsEnv>();
	}
	
	//这里这个TEXT("GameInstance")的GameInstance必须和MainGame.ts中传递的参数名一致，否则在MainGame.ts中无法通过puerts.getGlobal("GameInstance")获取到这个实例
	TArray<TPair<FString, UObject*>> Arguments;
	Arguments.Add({TEXT("GameInstance"),this});
	
	//启动脚本，指定入口模块为“MainGame”，并传递参数
	GameScript->Start(TEXT("MainGame"),Arguments);
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
