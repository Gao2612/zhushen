!macro customHeader
  !define MUI_UNWELCOMEPAGE_TITLE "离开汇流地之前"
  !define MUI_UNWELCOMEPAGE_TEXT "你即将卸载《诸神终应知晓》玩家自制史记。$\r$\n$\r$\n本地收藏、最近浏览和设置可能会随应用数据一并移除；若仍想保留档案痕迹，请先在设置页导出本地数据。"
  !define MUI_UNFINISHPAGE_TITLE "档案馆已暂时闭馆"
  !define MUI_UNFINISHPAGE_TEXT "《诸神终应知晓》玩家自制史记已从这台电脑移除。$\r$\n愿你在下一次打开档案时，仍能想起汇流地的微光。"
!macroend

!macro customUnInit
  MessageBox MB_ICONQUESTION|MB_YESNO \
    "确定要卸载《诸神终应知晓》玩家自制史记吗？$\r$\n$\r$\n如果想保留收藏、最近浏览和设置，请先取消卸载，并在应用设置页导出本地数据。" \
    IDYES continueUninstall
  Abort
  continueUninstall:
!macroend
