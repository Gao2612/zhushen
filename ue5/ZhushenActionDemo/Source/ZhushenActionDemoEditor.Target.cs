using UnrealBuildTool;
using System.Collections.Generic;

public class ZhushenActionDemoEditorTarget : TargetRules
{
    public ZhushenActionDemoEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("ZhushenActionDemo");
    }
}

