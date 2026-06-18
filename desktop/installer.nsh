!macro customHeader
  !define MUI_WELCOMEPAGE_TITLE "诸神终应知晓 档案馆安装器"
  !define MUI_WELCOMEPAGE_TEXT "欢迎来到《诸神终应知晓》玩家自制史记。$\r$\n$\r$\n安装器将为你建立一个离线档案馆，用于整理官方物料、角色资料、玩家二创和社区记忆。$\r$\n$\r$\n本应用为玩家整理的非商业纪念资料集，不代表官方立场或官方消息。"
  !define MUI_FINISHPAGE_TITLE "档案馆已经开启"
  !define MUI_FINISHPAGE_TEXT "安装完成。你可以从桌面或开始菜单进入《诸神终应知晓》玩家自制史记。$\r$\n$\r$\n愿汇流地的微光，仍在下一次打开档案时亮起。"
  !define MUI_UNWELCOMEPAGE_TITLE "汇流地档案封存程序"
  !define MUI_UNWELCOMEPAGE_TEXT "你即将卸载《诸神终应知晓》玩家自制史记。$\r$\n$\r$\n这会从当前电脑移除桌面客户端、快捷方式和安装目录。若仍想保留收藏、最近浏览和设置，请先回到应用设置页导出本地数据。$\r$\n$\r$\n确认后，档案馆将暂时闭馆。"
  !define MUI_UNFINISHPAGE_TITLE "档案馆已封存"
  !define MUI_UNFINISHPAGE_TEXT "《诸神终应知晓》玩家自制史记已从这台电脑移除。$\r$\n$\r$\n愿你在下一次打开档案时，仍能想起汇流地的微光。"
!macroend

!macro customUnInit
  MessageBox MB_ICONQUESTION|MB_YESNO \
    "确定要启动汇流地档案封存程序吗？$\r$\n$\r$\n如果想保留收藏、最近浏览和设置，请先取消卸载，并在应用设置页导出本地数据。" \
    IDYES continueUninstall
  Abort
  continueUninstall:
!macroend
