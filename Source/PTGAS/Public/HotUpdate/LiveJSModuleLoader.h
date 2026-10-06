#pragma once

#include "CoreMinimal.h"
#include "JSModuleLoader.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"

// 直接继承自官方自带的 DefaultJSModuleLoader
class FLiveJSModuleLoader : public puerts::DefaultJSModuleLoader
{
public:
	// 构造函数传入包体内默认目录 "JavaScript"（和原本保持完全一致）
	FLiveJSModuleLoader()
		: puerts::DefaultJSModuleLoader(TEXT("JavaScript"))
	{
		// 沙盒热更可写目录: <ProjectSavedDir>/HotUpdate/JavaScript/
		HotUpdateDir = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("HotUpdate/JavaScript"));
	}

	// 重写 Search：优先查 Saved 目录，找不到直接调用父类查找 Content 目录
	virtual bool Search(const FString& RequiredDir, const FString& RequiredModule, FString& Path, FString& AbsolutePath) override
	{
		FString ModuleName = RequiredModule;
		if (!ModuleName.EndsWith(TEXT(".js")) && !ModuleName.EndsWith(TEXT(".mjs")))
		{
			ModuleName += TEXT(".js");
		}

		// 1. 优先检查 Saved 目录是否有热更下来的文件
		FString HotFilePath = FPaths::Combine(HotUpdateDir, ModuleName);
		if (FPaths::FileExists(HotFilePath))
		{
			Path = HotFilePath;    // 真实路径，Load() 用它读盘
			AbsolutePath = FPaths::ConvertRelativePathToFull(HotFilePath);    // 调试器/堆栈用
			return true;
		}

		// 2. 没有热更文件，直接走父类的原生查找逻辑（读取包体内 Content/JavaScript/）
		return puerts::DefaultJSModuleLoader::Search(RequiredDir, RequiredModule, Path, AbsolutePath);
	}

private:
	FString HotUpdateDir;
};