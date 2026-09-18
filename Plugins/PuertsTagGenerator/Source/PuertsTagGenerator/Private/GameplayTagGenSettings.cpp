// Fill out your copyright notice in the Description page of Project Settings.


#include "GameplayTagGenSettings.h"

UGameplayTagGenSettings::UGameplayTagGenSettings()
{
	CategoryName = TEXT("Plugins");
	SectionName = TEXT("Puerts Tag Generator");

	// 默认导出路径：TypeScript/Gen/GameplayTags.gen.ts
	OutputFilePath.FilePath = TEXT("TypeScript/Gen/GameplayTags.gen.ts");
}
