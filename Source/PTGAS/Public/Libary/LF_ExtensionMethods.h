// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "EnhancedInputComponent.h"
#include "ExtensionMethods.h"
#include "LF_ExtensionMethods.generated.h"

//与下面函数一些参数有关
/**
 * @class UExtensionMethods  插件中编写的类
 */
UCLASS()
class PTGAS_API ULF_ExtensionMethods : public UExtensionMethods
{
	GENERATED_BODY()
	
public:
	/**
	 * 绑定输入动作
	 * @param  ImputComponent 输入组件
	 * @param InputAction 输入动作
	 * @param TriggerEvent 触发事件
	 * @param Object 绑定的对象
	 * @param FunctionName 绑定的函数
	 */
	UFUNCTION(BlueprintCallable, Category = "LFExtensionMethods")
	static void BindAction(UEnhancedInputComponent* InputComponent, const UInputAction* InputAction, const ETriggerEvent TriggerEvent, UObject* Object, const FName& FunctionName);
	
	
};
