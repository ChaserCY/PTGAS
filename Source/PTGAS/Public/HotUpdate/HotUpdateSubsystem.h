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

// 动态多播委托，用于在蓝图 UI 中接收热更状态回调
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCheckVersionResult, bool, bHasNewVersion, const FString&, NewVersion);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnUpdateProgress, float, Progress);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnUpdateFinished);

UCLASS()
class PTGAS_API UHotUpdateSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()
	
	public:
        virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    
	// 蓝图可调用的热更入口
	UFUNCTION(BlueprintCallable, Category = "HotUpdate")
	void StartCheckUpdate(const FString& RemoteVersionUrl);
    
	// 2. 蓝图调用的重启游戏接口
	UFUNCTION(BlueprintCallable, Category = "HotUpdate")
	void RestartGameApp();
	
	// 蓝图可绑定的事件（用来在 UI 上做弹窗、进度条）
	UPROPERTY(BlueprintAssignable, Category = "HotUpdate|Events")
	FOnCheckVersionResult OnCheckVersionResult;

	UPROPERTY(BlueprintAssignable, Category = "HotUpdate|Events")
	FOnUpdateProgress OnUpdateProgress;

	UPROPERTY(BlueprintAssignable, Category = "HotUpdate|Events")
	FOnUpdateFinished OnUpdateFinished;
	
    private:
	//在远程版本响应上，回调
	void OnRemoteVersionResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);
    //下载路径    
	void DownloadPatch(const FString& FileUrl, const FString& SavePath);
	//下载响应上，回调
	void OnDownloadResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful, FString SavePath);
	//下载进度上，回调
	void OnDownloadProgress(FHttpRequestPtr Request, int32 BytesSent, int32 BytesReceived);
    //获取本地版本
	FString GetLocalVersion() const;
	//保存本地版本
	void SaveLocalVersion(const FString& NewVersion);
	//缓存远程版本信息
	FVersionInfo CachedRemoteInfo;
	//本地版本文件路径
	FString LocalVersionFilePath;
};
