#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "ZhushenV01Hud.generated.h"

UCLASS()
class ZHUSHENACTIONDEMO_API AZhushenV01Hud : public AHUD
{
    GENERATED_BODY()

public:
    virtual void DrawHUD() override;
};

