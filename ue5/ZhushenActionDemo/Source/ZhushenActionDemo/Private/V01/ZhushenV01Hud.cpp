#include "V01/ZhushenV01Hud.h"

#include "Engine/Canvas.h"
#include "CanvasItem.h"
#include "Engine/Engine.h"
#include "Misc/App.h"

void AZhushenV01Hud::DrawHUD()
{
    Super::DrawHUD();

    if (!Canvas)
    {
        return;
    }

    const FLinearColor Gold(1.0f, 0.78f, 0.28f, 1.0f);
    const FLinearColor SoftWhite(0.92f, 0.90f, 0.84f, 1.0f);

    UFont* LargeFont = GEngine ? GEngine->GetLargeFont() : nullptr;
    UFont* SmallFont = GEngine ? GEngine->GetSmallFont() : nullptr;

    FCanvasTextItem Title(FVector2D(48.0f, 42.0f), FText::FromString(TEXT("Zhushen UE5 Demo v0.1")), LargeFont, Gold);
    Title.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Title);

    FCanvasTextItem Subtitle(FVector2D(50.0f, 90.0f), FText::FromString(TEXT("Environment Verification | Windows + Android")), SmallFont, SoftWhite);
    Subtitle.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Subtitle);

    const float DeltaSeconds = FApp::GetDeltaTime();
    const float CurrentFps = DeltaSeconds > 0.0f ? 1.0f / DeltaSeconds : 0.0f;
    FCanvasTextItem Fps(FVector2D(50.0f, 120.0f), FText::FromString(FString::Printf(TEXT("FPS %.1f"), CurrentFps)), SmallFont, SoftWhite);
    Fps.EnableShadow(FLinearColor::Black);
    Canvas->DrawItem(Fps);
}
