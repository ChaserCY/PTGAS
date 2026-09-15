// Fill out your copyright notice in the Description page of Project Settings.


#include "HotUpdate/HotUpdateSubsystem.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "JsonObjectConverter.h"
#include "Kismet/GameplayStatics.h"

void UHotUpdateSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
}

void UHotUpdateSubsystem::StartCheckUpdate(const FString& RemoteVersionUrl)
{
    // 请求远端 version.json
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
        // 没网或请求失败，直接启动游戏（走底包自带的 JS）
        LaunchGame();
        return;
    }

    FVersionInfo RemoteInfo;
    FJsonObjectConverter::JsonObjectStringToUStruct(Response->GetContentAsString(), &RemoteInfo, 0, 0);

    // 【核心修改】直接下载并覆盖到 Content/JavaScript/bundle.js
    FString LocalSavePath = FPaths::ProjectContentDir() / TEXT("JavaScript/bundle.js");

    UE_LOG(LogTemp, Log, TEXT("[HotUpdate] 正在下载热更补丁并直接覆盖: %s"), *LocalSavePath);
    DownloadPatch(RemoteInfo.downloadUrl, LocalSavePath);
}

void UHotUpdateSubsystem::DownloadPatch(const FString& FileUrl, const FString& SavePath)
{
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->OnProcessRequestComplete().BindUObject(this, &UHotUpdateSubsystem::OnDownloadResponse, SavePath);
    Request->SetURL(FileUrl);
    Request->SetVerb(TEXT("GET"));
    Request->ProcessRequest();
}

void UHotUpdateSubsystem::OnDownloadResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful, FString SavePath)
{
    if (bWasSuccessful && Response.IsValid() && Response->GetResponseCode() == 200)
    {
        TArray<uint8> Data = Response->GetContent();
        if (FFileHelper::SaveArrayToFile(Data, *SavePath))
        {
            UE_LOG(LogTemp, Log, TEXT("[HotUpdate] Patch applied successfully to: %s"), *SavePath);
        }
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("[HotUpdate] Download failed!"));
    }

    // 下载完成（无论成功与否），启动虚拟机并进入游戏
    LaunchGame();
}

void UHotUpdateSubsystem::LaunchGame()
{
    // 跳转到正式游戏关卡
    UGameplayStatics::OpenLevel(GetWorld(), FName(TEXT("Main_Map")));
}