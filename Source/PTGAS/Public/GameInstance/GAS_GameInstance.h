#pragma once

#include "CoreMinimal.h"
#include "JsEnv.h"
#include "Engine/GameInstance.h"
#include "GAS_GameInstance.generated.h"

/**
 *  GAS 游戏实例
 */
UCLASS()
class PTGAS_API UGAS_GameInstance : public UGameInstance
{
	GENERATED_BODY()
	
public:
	//初始化
	virtual void Init() override;
	
	//启动
	virtual void OnStart() override;
	
	//退出
	virtual void Shutdown() override;
	
	
protected:
	//是否为调试模式
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite,Category="Debug")
	uint8 bDebugMode : 1;
	
	//是否等待调试
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite,Category="Debug")
	uint8 bWaitForDebugger : 1;
	
	//调用ts函数的代理
	DECLARE_DYNAMIC_DELEGATE_TwoParams(FCall, FString, FunctionName, UObject*, Uobject);
	UPROPERTY()
	FCall FCall;
	//此处也必须与MainGame.ts中绑定FCall同名
	
	
	//调用ts函数
	UFUNCTION(BlueprintCallable)
	void CallTS(FString FunctionName, UObject* Uobject);
	
private:
	//脚本环境
	TSharedPtr<puerts::FJsEnv> GameScript; 
	
};

//写完后，右键--生成代码--生成定义