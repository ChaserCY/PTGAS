#include "HotUpdate/HotUpdateSubsystem.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "HAL/PlatformFileManager.h"
#include "JsonObjectConverter.h"
#include "Kismet/GameplayStatics.h"

void UHotUpdateSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    // 本地版本号记录文件存放在沙盒 PersistentDownloadDir 目录下
    LocalVersionFilePath = FPaths::ProjectPersistentDownloadDir() / TEXT("version.json");
}

FString UHotUpdateSubsystem::GetLocalVersion() const
{
    if (FPlatformFileManager::Get().GetPlatformFile().FileExists(*LocalVersionFilePath))
    {
        FString JsonStr;
        if (FFileHelper::LoadFileToString(JsonStr, *LocalVersionFilePath))
        {
            FVersionInfo LocalInfo;
            if (FJsonObjectConverter::JsonObjectStringToUStruct(JsonStr, &LocalInfo, 0, 0))
            {
                return LocalInfo.version;
            }
        }
    }
    return TEXT("1.0.0"); // 默认底包初始版本号
}

void UHotUpdateSubsystem::SaveLocalVersion(const FString& NewVersion)
{
    FVersionInfo Info;
    Info.version = NewVersion;
    Info.downloadUrl = CachedRemoteInfo.downloadUrl;
    FString OutJson;
    FJsonObjectConverter::UStructToJsonObjectString(Info, OutJson, 0, 0);
    FFileHelper::SaveStringToFile(OutJson, *LocalVersionFilePath);
}

void UHotUpdateSubsystem::StartCheckUpdate(const FString& RemoteVersionUrl)
{
    UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 正在向服务器请求版本信息..."));
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->OnProcessRequestComplete().BindUObject(this, &UHotUpdateSubsystem::OnRemoteVersionResponse);
    Request->SetURL(RemoteVersionUrl);
    Request->SetVerb(TEXT("GET"));
    Request->ProcessRequest();
}

void UHotUpdateSubsystem::OnRemoteVersionResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
    if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
    {
        UE_LOG(LogTemp, Warning, TEXT("[HotUpdate] 检查版本失败，跳过热更直接进入游戏。"));
        OnCheckVersionResult.Broadcast(false, TEXT(""));
        return;
    }

    FString ResponseStr = Response->GetContentAsString();
    FJsonObjectConverter::JsonObjectStringToUStruct(ResponseStr, &CachedRemoteInfo, 0, 0);

    FString LocalVer = GetLocalVersion();
    UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 本地版本: %s | 远端版本: %s"), *LocalVer, *CachedRemoteInfo.version);

    if (LocalVer.Equals(CachedRemoteInfo.version))
    {
        // 版本相同，无需更新
        UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 当前已是最新版本，无需更新。"));
        OnCheckVersionResult.Broadcast(false, CachedRemoteInfo.version);
    }
    else
    {
        // 版本不同，触发更新！通知 UI 弹出“发现新版本”
        UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 发现新版本，开始下载热更包..."));
        OnCheckVersionResult.Broadcast(true, CachedRemoteInfo.version);

        FString LocalSavePath = FPaths::ProjectContentDir() / TEXT("JavaScript/bundle.js");
        DownloadPatch(CachedRemoteInfo.downloadUrl, LocalSavePath);
    }
}

void UHotUpdateSubsystem::DownloadPatch(const FString& FileUrl, const FString& SavePath)
{
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->OnProcessRequestComplete().BindUObject(this, &UHotUpdateSubsystem::OnDownloadResponse, SavePath);
    Request->OnRequestProgress().BindUObject(this, &UHotUpdateSubsystem::OnDownloadProgress);
    Request->SetURL(FileUrl);
    Request->SetVerb(TEXT("GET"));
    Request->ProcessRequest();
}

void UHotUpdateSubsystem::OnDownloadProgress(FHttpRequestPtr Request, int32 BytesSent, int32 BytesReceived)
{
    if (Request.IsValid())
    {
        // 1. 使用 GetResponse() 而不是 GetHttpResponse()
        FHttpResponsePtr Response = Request->GetResponse();
        
        // 2. 判空并确保文件总大小大于 0
        if (Response.IsValid() && Response->GetContentLength() > 0)
        {
            float TotalSize = (float)Response->GetContentLength();
            float Progress = (float)BytesReceived / TotalSize;
            OnUpdateProgress.Broadcast(Progress); // 广播下载进度给 UI 进度条
        }
    }
}

void UHotUpdateSubsystem::OnDownloadResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful, FString SavePath)
{
    if (bWasSuccessful && Response.IsValid() && Response->GetResponseCode() == 200)
    {
        TArray<uint8> Data = Response->GetContent();
        if (FFileHelper::SaveArrayToFile(Data, *SavePath))
        {
            // 下载成功，把远端版本号写入本地记录文件
            SaveLocalVersion(CachedRemoteInfo.version);
            UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 补丁下载成功并落盘！新版本记录已保存。"));
            
            // 广播更新完成事件（UI 此时可以弹窗提示：“更新完成，请点击按钮重启游戏”）
            OnUpdateFinished.Broadcast();
            return;
        }
    }
    
    UE_LOG(LogTemp, Error, TEXT("[HotUpdate] 热更补丁下载失败！"));
}

void UHotUpdateSubsystem::RestartGameApp()
{
    UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 触发重启游戏指令..."));
    
    #if WITH_EDITOR
        // 如果当前是在虚幻编辑器（PIE）中测试，为了防止编辑器崩溃，我们只做“退出游戏/停止PIE”处理
        if (GIsEditor)
        {
            UE_LOG(LogTemp, Warning, TEXT("[HotUpdate] 当前处于编辑器模式，无法拉起新进程。正在安全退出 PIE..."));
            UKismetSystemLibrary::QuitGame(GetWorld(), nullptr, EQuitPreference::Quit, false);
            return;
        }
    #endif
    
        // 以下代码仅在【打包后的独立游戏（Standalone）】中才会执行：
        FString ExecutablePath = FPlatformProcess::ExecutablePath();
        FString CommandLine = FCommandLine::Get();
    
        // 1. 启动一个新的游戏进程
        FPlatformProcess::CreateProc(*ExecutablePath, *CommandLine, true, false, false, nullptr, 0, nullptr, nullptr);
        
        // 2. 关闭当前游戏进程
        FGenericPlatformMisc::RequestExit(false);
}