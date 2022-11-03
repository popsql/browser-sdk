export declare type MouseEventOnElement = MouseEvent & {
    target: Element;
};
export declare type GetUserActivity = () => {
    selection: boolean;
    input: boolean;
};
export interface ActionEventsHooks<ClickContext> {
    onPointerDown: (event: MouseEventOnElement) => ClickContext | undefined;
    onClick: (context: ClickContext, event: MouseEventOnElement, getUserActivity: GetUserActivity) => void;
}
export declare function listenActionEvents<ClickContext>({ onPointerDown, onClick }: ActionEventsHooks<ClickContext>): {
    stop: () => void;
};
