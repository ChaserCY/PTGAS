#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimNotifies/AnimNotify.h"
#include "LfAnimNotify_Script.generated.h"

/**
 * 动画脚本通知(用于动画直接调用函数，无参的)
 */
UCLASS()
class PTGAS_API ULfAnimNotify_Script : public UAnimNotify
{
	GENERATED_BODY()
	
	UPROPERTY(EditAnywhere, Category="Name")
	FName FunctionName = "None";
	
	//获取通知名称
	virtual FString GetNotifyName_Implementation() const override;
	
	//触发通知
	virtual void Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation, const FAnimNotifyEventReference& EventReference) override;
};
