export declare const COOKIE_ACCESS_DELAY = 1000;
export declare type SetCookieOverride = (name: string, value: string, expireDelay: number) => void;
export declare type GetCookieOverride = (name: string) => string | undefined;
export interface CookieOptions {
    secure?: boolean;
    crossSite?: boolean;
    domain?: string;
    setCookie?: SetCookieOverride;
    getCookie?: GetCookieOverride;
}
export declare function setCookieHandling(getCookie: GetCookieOverride, setCookie: SetCookieOverride): void;
export declare function setCookie(name: string, value: string, expireDelay: number, options?: CookieOptions): void;
export declare function getCookie(name: string): string | undefined;
export declare function deleteCookie(name: string, options?: CookieOptions): void;
export declare function areCookiesAuthorized(options: CookieOptions): boolean;
export declare function getCurrentSite(): string;
