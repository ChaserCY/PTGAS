// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Abilitys/BaseAttributeSet.h"
#include "GameFramework/Character.h"
#include "BaseCharacter.generated.h"

struct FOnAttributeChangedData;
class UAbilitySystemComponent;

//监听属性变化的代理
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAttributeChanged, float, Value);

/*
 * 基础角色
 */


UCLASS()
class PTGAS_API ABaseCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	ABaseCharacter();

protected:
	virtual void BeginPlay() override;

public:	
	virtual void Tick(float DeltaTime) override;
	
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
	
	
	//技能系统组件(核心组件)
protected:
	UPROPERTY(EditDefaultsOnly,BlueprintReadOnly, Category="AbilitySystem" )
	TObjectPtr<UAbilitySystemComponent>  AbilitySystemComponent;
	
	//监听血量变化
	UPROPERTY(BlueprintAssignable, Category="AbbilitySystem")
	FOnAttributeChanged HPChanged;
	void OnHPAttributeChanged(const FOnAttributeChangeData& Data);
	
	//监听血量变化
	UPROPERTY(BlueprintAssignable, Category="AbbilitySystem")
	FOnAttributeChanged MPChanged;
	void OnMPAttributeChanged(const FOnAttributeChangeData& Data);
	
	//监听血量变化
	UPROPERTY(BlueprintAssignable, Category="AbbilitySystem")
	FOnAttributeChanged SPChanged;
	void OnSPAttributeChanged(const FOnAttributeChangeData& Data);
	
};
