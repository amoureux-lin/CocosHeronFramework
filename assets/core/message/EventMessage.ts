export class EventMessage {
    /** 游戏从后台进入事件 */
    static GAME_SHOW = "GAME_ENTER";
    /** 游戏切到后台事件 */
    static GAME_HIDE = "GAME_EXIT";
    /** 游戏画笔尺寸变化事件 */
    static GAME_RESIZE = "GAME_RESIZE";
    /** 游戏全屏事件 */
    static GAME_FULL_SCREEN = "GAME_FULL_SCREEN";
    /** 游戏旋转屏幕事件 */
    static GAME_ORIENTATION = "GAME_ORIENTATION";
}