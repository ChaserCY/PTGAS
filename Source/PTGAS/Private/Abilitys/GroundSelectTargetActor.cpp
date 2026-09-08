// Fill out your copyright notice in the Description page of Project Settings.


#include "Abilitys/GroundSelectTargetActor.h"

#include "Abilities/GameplayAbility.h"

AGroundSelectTargetActor::AGroundSelectTargetActor()
{
}

void AGroundSelectTargetActor::BeginPlay()
{
	Super::BeginPlay();
}

void AGroundSelectTargetActor::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

void AGroundSelectTargetActor::StartTargeting(UGameplayAbility* Ability)
{
	Super::StartTargeting(Ability);
	//基类成员变量，不会自动初始化，必须要在这个函数手动赋值
	PrimaryPC = Cast<APlayerController>(Ability->GetOwningActorFromActorInfo()->GetInstigatorController());
}

void AGroundSelectTargetActor::ConfirmTargetingAndContinue()
{
	FVector LookPoint = GetPlayerLookAtPoint();  //获取玩家当前朝向的点
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
		FCollisionShape::MakeSphere(SelectRadius), //球体半径
		CollisionParams
		);
		
		//创建一个数据句柄，用来封装目标信息，GAS的“目标数据容器”，多态数据数组
		FGameplayAbilityTargetDataHandle TargetDataHandle;
		//创建一个目标位置信息，并且将它加入到目标数据句柄中
		FGameplayAbilityTargetData_LocationInfo* CenterLocation = new FGameplayAbilityTargetData_LocationInfo();
		CenterLocation->TargetLocation.LiteralTransform = FTransform(LookPoint); //目标位置
		CenterLocation->TargetLocation.LocationType = EGameplayAbilityTargetingLocationType::LiteralTransform; //目标位置类型，字面值变换
			TargetDataHandle.Add(CenterLocation); //0
		
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

FVector AGroundSelectTargetActor::GetPlayerLookAtPoint()
{
	FVector ViewLocation;//玩家视口位置
	FRotator ViewRotation;//玩家视口旋转
	//获取玩家当前朝向的点
	PrimaryPC->GetPlayerViewPoint(ViewLocation, ViewRotation);
	
	
	FHitResult HitResult;
	FCollisionQueryParams CollisionParams;
	CollisionParams.AddIgnoredActor(PrimaryPC->GetOwner());
	//单条射线检测
	GetWorld()->LineTraceSingleByChannel(
		HitResult,
		ViewLocation,
		ViewLocation + ViewRotation.Vector() * 5000.f,   //沿摄像机朝向延伸5000单位
		ECC_Visibility,
		CollisionParams                           //附加参数，忽略玩家自己
	);
	
	//如果有阻碍
	if (HitResult.bBlockingHit)
	{
		return HitResult.ImpactPoint;   //返回阻碍点
	}
	
	return FVector::Zero();
}
