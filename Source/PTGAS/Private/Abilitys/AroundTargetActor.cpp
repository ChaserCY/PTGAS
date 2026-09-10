// Fill out your copyright notice in the Description page of Project Settings.


#include "Abilitys/AroundTargetActor.h"

#include "Abilities/GameplayAbility.h"


// Sets default values
AAroundTargetActor::AAroundTargetActor()
{
	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;
}

// Called when the game starts or when spawned
void AAroundTargetActor::BeginPlay()
{
	Super::BeginPlay();
	
}

// Called every frame
void AAroundTargetActor::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

void AAroundTargetActor::StartTargeting(UGameplayAbility* Ability)
{
	Super::StartTargeting(Ability);
	//基类成员变量，不会自动初始化，必须要在这个函数手动赋值
	PrimaryPC = Cast<APlayerController>(Ability->GetOwningActorFromActorInfo()->GetInstigatorController());
}

void AAroundTargetActor::ConfirmTargetingAndContinue()
{
	FVector LookPoint = PrimaryPC->GetPawn()->K2_GetActorLocation();  //获取玩家当前位置
	if (LookPoint.Size()!=0)
	{
		//重叠检测结果
		TArray<FOverlapResult> OverlapResults;
		//弱指针存储重叠的Actor为什么用弱指针？—目标选择是一个异步过程，从玩家确认到技能真正释放有时间差。如果敌人在这
		//期间被别的技能杀死，裸指针会变成悬空指针。弱指针会自动感知对象销毁，安全处理。
		TArray<TWeakObjectPtr<AActor>> OverlapActors;
		
		FCollisionQueryParams CollisionParams;
		CollisionParams.AddIgnoredActor(PrimaryPC->GetOwner());
		
		//在看到的点进行球体重叠检测
		bool IsHit = GetWorld()->OverlapMultiByChannel(
		OverlapResults,
		LookPoint,
		FQuat::Identity,             //无旋转
		ECC_Pawn,                   //检测Pawn
		FCollisionShape::MakeSphere(AroundRadius), //球体半径
		CollisionParams
		);
		
		//创建一个数据句柄，用来封装目标信息，GAS的“目标数据容器”，多态数据数组
		FGameplayAbilityTargetDataHandle TargetDataHandle;
		
		//创建Actor数组数据
		FGameplayAbilityTargetData_ActorArray* ActorArray = new FGameplayAbilityTargetData_ActorArray();
		
		if (IsHit)
		{
			for (int i = 0;i < OverlapResults.Num();i++)
			{
				APawn* HitPawn = Cast<APawn>(OverlapResults[i].GetActor());
				if (HitPawn && !OverlapActors.Contains(HitPawn))
				{
					OverlapActors.AddUnique(HitPawn);
				}
			}
			if(!OverlapActors.IsEmpty())
			{
				ActorArray->SetActors(OverlapActors);
				TargetDataHandle.Add(ActorArray); //1
			}
		}
		//检查并且应用目标数据
		check(ShouldProduceTargetData())
		//如果目标数据有效，就广播目标数据
		if (IsConfirmTargetingAllowed())
		{
			TargetDataReadyDelegate.Broadcast(TargetDataHandle);
		}
	}
	
	return;
}

