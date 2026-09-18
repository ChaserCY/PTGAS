// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "GameplayTagGenSettings.generated.h"

/**
 * 
 */
UCLASS(config = Editor, defaultconfig, meta = (DisplayName = "Puerts Tag Generator"))
class PUERTSTAGGENERATOR_API UGameplayTagGenSettings : public UDeveloperSettings
{
	GENERATED_BODY()
	
public:
	UGameplayTagGenSettings();

	/** TS 文件的生成相对路径（相对于项目根目录 ProjectDir） */
	UPROPERTY(config, EditAnywhere, Category = "Config", meta = (FilePathFilter = "TypeScript File (*.ts)|*.ts"))
	FFilePath OutputFilePath;
};
