#include "HotUpdate/HotUpdateSubsystem.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "HAL/PlatformFileManager.h"
#include "JsonObjectConverter.h"
#include "Kismet/GameplayStatics.h"

void UHotUpdateSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    // 本地版本号记录文件存放在Saved/PersistentDownloadDir/ 目录下
    // （打包后 Saved 会解析到 %LOCALAPPDATA%\<项目名>\Saved\）
    LocalVersionFilePath = FPaths::ProjectPersistentDownloadDir() / TEXT("version.json");

    // 必须先把目录建出来：FFileHelper::SaveStringToFile 不会自动创建父目录，
    // 打包版首次运行（Saved/PersistentDownloadDir 还不存在）时，版本号会静默写不进去，
    // 表现为每次都判定“有新版本”反复下载
    FPlatformFileManager::Get().GetPlatformFile().CreateDirectoryTree(*FPaths::ProjectPersistentDownloadDir());
}

FString UHotUpdateSubsystem::GetLocalVersion() const
{
    if (FPlatformFileManager::Get().GetPlatformFile().FileExists(*LocalVersionFilePath))
    {
        FString JsonStr;
        //读入磁盘文件内容到JsonStr
        if (FFileHelper::LoadFileToString(JsonStr, *LocalVersionFilePath))
        {
            FCold_VersionInfo LocalInfo;
            //将JsonStr转换为FVersionInfo结构体
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
    FCold_VersionInfo Info;
    Info.version = NewVersion;
    Info.downloadUrl = CachedRemoteInfo.downloadUrl;
    FString OutJson;
    FJsonObjectConverter::UStructToJsonObjectString(Info, OutJson, 0, 0);
    FFileHelper::SaveStringToFile(OutJson, *LocalVersionFilePath);
}

void UHotUpdateSubsystem::StartCheckUpdate(const FString& RemoteVersionUrl)
{
    UE_LOG(LogTemp, Log, TEXT("[ColdUpdate] 正在向服务器请求版本信息..."));
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    //绑定请求完成回调函数
    Request->OnProcessRequestComplete().BindUObject(this, &UHotUpdateSubsystem::OnRemoteVersionResponse);
    Request->SetURL(RemoteVersionUrl);
    Request->SetVerb(TEXT("GET"));
    //发送请求，异步处理，不会阻塞主线程，直到请求完成或超时
    Request->ProcessRequest();
}

void UHotUpdateSubsystem::OnRemoteVersionResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
    if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
    {
        UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 检查版本失败，跳过热更直接进入游戏。"));
        // 通知 UI 弹出“检查版本失败”
        OnCheckVersionResult.Broadcast(false, TEXT(""));
        return;
    }

    //将Http响应内容转换为字符串，再解析为FVersionInfo结构体
    FString ResponseStr = Response->GetContentAsString();
    FJsonObjectConverter::JsonObjectStringToUStruct(ResponseStr, &CachedRemoteInfo, 0, 0);

    FString LocalVer = GetLocalVersion();
    UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 本地版本: %s | 远端版本: %s"), *LocalVer, *CachedRemoteInfo.version);

    //比较版本字符串
    if (LocalVer.Equals(CachedRemoteInfo.version))
    {
        // 版本相同，无需更新
        UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 当前已是最新版本，无需更新。"));
        OnCheckVersionResult.Broadcast(false, CachedRemoteInfo.version);
    }
    else
    {
        // 版本不同，触发更新！通知 UI 弹出“发现新版本”
        UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 发现新版本，开始下载热更包..."));
        OnCheckVersionResult.Broadcast(true, CachedRemoteInfo.version);

        // 落盘到沙盒可写目录，与 Live 热更完全一致：<ProjectSavedDir>/HotUpdate/JavaScript/bundle.js
        // 打包后 ProjectSavedDir 会解析到 %LOCALAPPDATA%\<项目名>\Saved\（用户可写，装在 Program Files 下也没问题），
        // 同时不再覆盖安装目录/工程目录里的包体版本 —— 包体那份始终是可回退的干净基线
        FString SaveDir = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("HotUpdate/JavaScript"));
        FPlatformFileManager::Get().GetPlatformFile().CreateDirectoryTree(*SaveDir);
        FString LocalSavePath = FPaths::Combine(SaveDir, TEXT("bundle.js"));
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
            UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 补丁下载成功并落盘！新版本记录已保存。"));
            
            // 广播更新完成事件（UI 此时可以弹窗提示：“更新完成，请点击按钮重启游戏”）
            OnUpdateFinished.Broadcast();
            return;
        }
    }
    
    UE_LOG(LogTemp, Error, TEXT("[ColdUpdate] 热更补丁下载失败！"));
}

void UHotUpdateSubsystem::RestartGameApp()
{
    UE_LOG(LogTemp, Warning, TEXT("[ColdUpdate] 触发重启游戏指令..."));
    
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
    // 1. 获取当前游戏进程的路径和命令行参数
        FString ExecutablePath = FPlatformProcess::ExecutablePath();
    // 2. 获取当前游戏进程的命令行参数
    FString CommandLine = FCommandLine::Get();
    
        // 1. 启动一个新的游戏进程
        FPlatformProcess::CreateProc(*ExecutablePath, *CommandLine, true, false, false, nullptr, 0, nullptr, nullptr);
        
        // 2. 关闭当前游戏进程
        FGenericPlatformMisc::RequestExit(false);
}