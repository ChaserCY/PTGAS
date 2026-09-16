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
//vision.json同款结构
//变量名必须与JSON的键名一致
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
	//重写初始化
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    
	// 1.蓝图可调用的热更大入口，接收一个URL，向网页发送Get请求
	UFUNCTION(BlueprintCallable, Category = "HotUpdate")
	void StartCheckUpdate(const FString& RemoteVersionUrl);
    
	// 2. 蓝图调用的重启游戏接口(内含PIE与打包版本的隔离)
	UFUNCTION(BlueprintCallable, Category = "HotUpdate")
	void RestartGameApp();
	
	// 蓝图可绑定的事件（用来在 UI 上做弹窗、进度条）
	//检查是否有新版本，返回bool和新版本的vision
	UPROPERTY(BlueprintAssignable, Category = "HotUpdate|Events")
	FOnCheckVersionResult OnCheckVersionResult;

	//持续更新进度，返回一个小数值
	UPROPERTY(BlueprintAssignable, Category = "HotUpdate|Events")
	FOnUpdateProgress OnUpdateProgress;

	//是否更新完成
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
	//保存新版本至本地文件
	void SaveLocalVersion(const FString& NewVersion);
	//缓存远程版本信息
	FVersionInfo CachedRemoteInfo;
	//本地版本文件路径
	FString LocalVersionFilePath;
};
