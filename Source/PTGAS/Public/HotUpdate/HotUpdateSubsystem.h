// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Http.h"
#include "JsEnv.h"
#include "HotUpdateSubsystem.generated.h"

/**
 * 
 */

USTRUCT()
struct FVersionInfo
{
	GENERATED_BODY()
	UPROPERTY()
	FString version;
	UPROPERTY()
	FString downloadUrl;
};


UCLASS()
class PTGAS_API UHotUpdateSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()
	
	public:
        virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    
        // 蓝图可调用的热更入口
        UFUNCTION(BlueprintCallable, Category = "HotUpdate")
        void StartCheckUpdate(const FString& RemoteVersionUrl);
    
    private:
	//在远程版本响应上，回调
	void OnRemoteVersionResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);
    //下载路径    
	void DownloadPatch(const FString& FileUrl, const FString& SavePath);
	//下载响应上，回调
	void OnDownloadResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful, FString SavePath);
	//启动游戏
	void LaunchGame();
	
	FString RemotePatchUrl;
};
