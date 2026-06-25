using UnrealBuildTool;
using System.Collections.Generic;

public class ZhushenActionDemoTarget : TargetRules
{
    public ZhushenActionDemoTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("ZhushenActionDemo");
    }
}

