#include "V01/ZhushenV01Hud.h"

#include "Engine/Canvas.h"
#include "CanvasItem.h"
#include "Engine/Engine.h"

void AZhushenV01Hud::DrawHUD()
{
    Super::DrawHUD();

    if (!Canvas)
    {
        return;
    }

    const FLinearColor Gold(1.0f, 0.78f, 0.28f, 1.0f);
    const FLinearColor SoftWhite(0.92f, 0.90f, 0.84f, 1.0f);

    FCanvasTextItem Title(FVector2D(48.0f, 42.0f), FText::FromString(TEXT("Zhushen UE5 Demo v0.1")), GEngine->GetLargeFont(), Gold);
    Title.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Title);

    FCanvasTextItem Subtitle(FVector2D(50.0f, 90.0f), FText::FromString(TEXT("Environment Verification | Windows + Android")), GEngine->GetSmallFont(), SoftWhite);
    Subtitle.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Subtitle);

    const float AverageFps = GEngine ? GEngine->GetAverageFPS() : 0.0f;
    FCanvasTextItem Fps(FVector2D(50.0f, 120.0f), FText::FromString(FString::Printf(TEXT("FPS %.1f"), AverageFps)), GEngine->GetSmallFont(), SoftWhite);
    Fps.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Fps);
}
