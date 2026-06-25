#include "V01/ZhushenV01Pawn.h"

#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "UObject/ConstructorHelpers.h"

AZhushenV01Pawn::AZhushenV01Pawn()
{
    PrimaryActorTick.bCanEverTick = false;
    AutoPossessPlayer = EAutoReceiveInput::Player0;

    BodyMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BodyMesh"));
    RootComponent = BodyMesh;

    static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeMesh(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (CubeMesh.Succeeded())
    {
        BodyMesh->SetStaticMesh(CubeMesh.Object);
    }
    BodyMesh->SetWorldScale3D(FVector(0.8f, 0.8f, 1.8f));

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 900.0f;
    CameraBoom->SetRelativeRotation(FRotator(-55.0f, 0.0f, 0.0f));
    CameraBoom->bDoCollisionTest = false;

    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    Camera->bUsePawnControlRotation = false;
}

