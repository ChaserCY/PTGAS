#pragma once

#include "CoreMinimal.h"
#include "EditorSubsystem.h"
#include "Containers/Ticker.h" // 引入 Ticker
#include "GameplayTagTSGenSubsystem.generated.h"

UCLASS()
class PUERTSTAGGENERATOR_API UGameplayTagTSGenSubsystem : public UEditorSubsystem
{
	GENERATED_BODY()

public:
	// 初始化子系统
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	// 注销子系统
	virtual void Deinitialize() override;

	// 生成 Gameplay Tag 的 TypeScript 提示文件
	UFUNCTION(BlueprintCallable, Category = "Puerts")
	void GenerateGameplayTagTS();

private:
	// ==触发生成== TS 文件，添加防抖逻辑
	void TriggerGenerateWithDebounce();

	// 使用更轻量稳定的 FTSTicker 句柄，替换掉 FTimerHandle
	FTSTicker::FDelegateHandle DebounceTickerHandle;
};