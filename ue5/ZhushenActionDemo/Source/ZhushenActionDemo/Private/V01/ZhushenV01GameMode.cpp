#include "V01/ZhushenV01GameMode.h"

#include "V01/ZhushenV01Hud.h"
#include "V01/ZhushenV01Pawn.h"

AZhushenV01GameMode::AZhushenV01GameMode()
{
    DefaultPawnClass = AZhushenV01Pawn::StaticClass();
    HUDClass = AZhushenV01Hud::StaticClass();
}

