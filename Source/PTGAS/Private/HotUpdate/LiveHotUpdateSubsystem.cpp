#include "HotUpdate/LiveHotUpdateSubsystem.h"
#include "HttpModule.h"
#include "JsonObjectConverter.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "HAL/PlatformFileManager.h"
#include "Kismet/GameplayStatics.h"
#include "GameInstance/GAS_GameInstance.h"

void ULiveHotUpdateSubsystem::ClearHotUpdateCache()
{
    FString SaveDir = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("HotUpdate"));
    FPlatformFileManager::Get().GetPlatformFile().DeleteDirectoryRecursively(*SaveDir);
    UE_LOG(LogTemp, Warning, TEXT("[PTGAS] 热更缓存已清空，当前仅生效包体内置逻辑"));
}

void ULiveHotUpdateSubsystem::DoLiveHotUpdate(const FString& InUrl, FName InTargetMap)
{
    // InUrl 是版本信息地址(version.json)，不是 bundle.js 本身的地址
    VersionUrl = InUrl;
    TargetMap = InTargetMap;
    CachedRemoteInfo = FHot_VersionInfo();

    OnLiveStatusChanged.Broadcast(TEXT("正在请求版本信息..."));

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(VersionUrl);
    Request->SetVerb(TEXT("GET"));
    Request->OnProcessRequestComplete().BindUObject(this, &ULiveHotUpdateSubsystem::OnVersionFetched);
    Request->ProcessRequest();
}

void ULiveHotUpdateSubsystem::OnVersionFetched(FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess)
{
    if (!bSuccess || !Resp.IsValid() || Resp->GetResponseCode() != 200)
    {
        OnLiveStatusChanged.Broadcast(TEXT("版本信息请求失败！请检查网络或 URL"));
        return;
    }

    // 与冷更子系统共用同一份 JSON 结构：{"version": "1.0.1", "downloadUrl": "http://.../bundle.js"}
    const FString ResponseStr = Resp->GetContentAsString();
    if (!FJsonObjectConverter::JsonObjectStringToUStruct(ResponseStr, &CachedRemoteInfo, 0, 0)
        || CachedRemoteInfo.downloadUrl.IsEmpty())
    {
        UE_LOG(LogTemp, Error, TEXT("[LiveUpdate] 版本信息解析失败，原始内容: %s"), *ResponseStr);
        OnLiveStatusChanged.Broadcast(TEXT("版本信息解析失败！"));
        return;
    }

    UE_LOG(LogTemp, Warning, TEXT("[LiveUpdate] 远端版本: %s | 下载地址: %s"),
        *CachedRemoteInfo.version, *CachedRemoteInfo.downloadUrl);

    OnLiveStatusChanged.Broadcast(FString::Printf(TEXT("发现版本 %s，正在下载 bundle.js..."), *CachedRemoteInfo.version));

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(CachedRemoteInfo.downloadUrl);
    Request->SetVerb(TEXT("GET"));
    Request->OnProcessRequestComplete().BindUObject(this, &ULiveHotUpdateSubsystem::OnDownloadFinished);
    Request->ProcessRequest();
}

void ULiveHotUpdateSubsystem::OnDownloadFinished(FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess)
{
    if (!bSuccess || !Resp.IsValid() || Resp->GetResponseCode() != 200)
    {
        OnLiveStatusChanged.Broadcast(TEXT("热更文件下载失败！请检查网络或 URL"));
        return;
    }

    // 保存到沙盒可写目录
    FString SaveDir = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("HotUpdate/JavaScript"));
    FPlatformFileManager::Get().GetPlatformFile().CreateDirectoryTree(*SaveDir);
    FString SavePath = FPaths::Combine(SaveDir, TEXT("bundle.js"));

    if (!FFileHelper::SaveArrayToFile(Resp->GetContent(), *SavePath))
    {
        OnLiveStatusChanged.Broadcast(TEXT("文件写入本地失败！"));
        return;
    }

    OnLiveStatusChanged.Broadcast(TEXT("下载成功，切关重载虚拟机中..."));
    SwitchLevelAndReload();
}

void ULiveHotUpdateSubsystem::SwitchLevelAndReload()
{
    // 切换到空白过渡关卡：销毁旧世界中绑有 TS 原型和 GAS Delegate 的 Actor
    UGameplayStatics::OpenLevel(this, FName("HotReloadTransition_Map"));

    // 延迟 0.3 秒，确保旧关卡 Actor 已完全卸载
    FTimerHandle TimerHandle;
    GetWorld()->GetTimerManager().SetTimer(TimerHandle, [this]()
    {
        if (UGAS_GameInstance* GI = Cast<UGAS_GameInstance>(GetGameInstance()))
        {
            GI->RestartJsEnv();
        }

        // 重新切回主关卡，此时最新的 TS 逻辑全面生效
        UGameplayStatics::OpenLevel(this, TargetMap);
    }, 0.3f, false);
}