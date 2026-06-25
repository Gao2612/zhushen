#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "ZhushenV01Pawn.generated.h"

class UCameraComponent;
class USpringArmComponent;
class UStaticMeshComponent;

UCLASS()
class ZHUSHENACTIONDEMO_API AZhushenV01Pawn : public APawn
{
    GENERATED_BODY()

public:
    AZhushenV01Pawn();

private:
    UPROPERTY(VisibleAnywhere, Category = "v0.1")
    TObjectPtr<UStaticMeshComponent> BodyMesh;

    UPROPERTY(VisibleAnywhere, Category = "v0.1")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, Category = "v0.1")
    TObjectPtr<UCameraComponent> Camera;
};

