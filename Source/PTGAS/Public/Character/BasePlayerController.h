// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "BasePlayerController.generated.h"

/**
 * 
 */
UCLASS()
class PTGAS_API ABasePlayerController : public APlayerController
{
	GENERATED_BODY()
	
public:
	UFUNCTION(BlueprintCallable,BlueprintNativeEvent,Category = "TSLogic")
	void Melee();
	
	UFUNCTION(BlueprintCallable,BlueprintNativeEvent,Category = "TSLogic")
	void HPRegen();
	
	UFUNCTION(BlueprintCallable,BlueprintNativeEvent,Category = "TSLogic")
	void TestAction();
	
	UFUNCTION(BlueprintCallable,BlueprintNativeEvent,Category = "TSLogin")
	void Dash();
	
	UFUNCTION(BlueprintCallable, BlueprintNativeEvent,Category = "TSLogic")
	void Laser();
	
	UFUNCTION(BlueprintCallable, BlueprintNativeEvent,Category = "TSLogin")
	void GroundBlast();
	
	UFUNCTION(BlueprintCallable, BlueprintNativeEvent,Category = "TSLogic")
	void RightPressed();
};
