using UnrealBuildTool;

public class ZhushenActionDemo : ModuleRules
{
    public ZhushenActionDemo(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore"
        });
    }
}

