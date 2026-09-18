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
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Puerts")
	void GenerateGameplayTagTS();

private:
	void TriggerGenerateWithDebounce();

	// 使用更轻量稳定的 FTSTicker 句柄，替换掉 FTimerHandle
	FTSTicker::FDelegateHandle DebounceTickerHandle;
};