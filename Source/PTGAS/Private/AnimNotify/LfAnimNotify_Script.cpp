// Fill out your copyright notice in the Description page of Project Settings.


#include "AnimNotify/LfAnimNotify_Script.h"

FString ULfAnimNotify_Script::GetNotifyName_Implementation() const
{
	return FunctionName.ToString();
}

void ULfAnimNotify_Script::Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
	const FAnimNotifyEventReference& EventReference)
{
	Super::Notify(MeshComp, Animation, EventReference);
	
	if (!MeshComp) return;
	
	if (AActor* TempActor = MeshComp->GetOwner())
	{
		if (UFunction* TempFunction = TempActor->FindFunction(FunctionName))
		{
			UE_LOG(LogTemp, Warning, TEXT("AnimNotify_Script: %s"), *FunctionName.ToString());
			
			TempActor->ProcessEvent(TempFunction, nullptr);
		}
	}
	
}
