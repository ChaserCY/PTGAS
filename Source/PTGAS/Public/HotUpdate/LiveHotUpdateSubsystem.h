#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "LiveHotUpdateSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnLiveStatusChanged, const FString&, Message);

USTRUCT()
struct FHot_VersionInfo
{
	GENERATED_BODY()
	UPROPERTY()
	FString version;
	UPROPERTY()
	FString downloadUrl;
};

UCLASS()
class PTGAS_API ULiveHotUpdateSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** 开始热更：请求版本信息 -> 下载 bundle.js -> 自动切过渡关卡 -> 重启 JS 虚拟机 -> 进游戏
	 *  InUrl 传的是版本信息地址(version.json)，和冷更子系统用的是同一个 URL、同一份 JSON 结构
	 */
	UFUNCTION(BlueprintCallable, Category = "LiveHotUpdate")
	void DoLiveHotUpdate(const FString& InUrl, FName InTargetMap = FName("MainGameMap"));

	/** 清空热更缓存（防止冷更测试受到上次热更文件的干扰） */
	UFUNCTION(BlueprintCallable, Category = "LiveHotUpdate")
	void ClearHotUpdateCache();

	UPROPERTY(BlueprintAssignable, Category = "LiveHotUpdate")
	FOnLiveStatusChanged OnLiveStatusChanged;

private:
	/** 版本信息(version.json)请求完成 */
	void OnVersionFetched(FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess);
	/** bundle.js 下载完成 */
	void OnDownloadFinished(FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess);
	void SwitchLevelAndReload();

	FString VersionUrl;
	FName TargetMap;
	// 与冷更子系统 FCold_VersionInfo 字段完全一致，直接对应同一份 JSON
	FHot_VersionInfo CachedRemoteInfo;
};