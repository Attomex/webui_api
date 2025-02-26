import Cookies from "js-cookie";
import cookie from "cookie";

export const isLoggedIn = (reqCookies = null) => {
    if (!reqCookies) {
        return !!Cookies.get("auth_token");
    }

    return !!cookie.parse(reqCookies).auth_token;
}

export const logIn = (token) => {
    Cookies.set("auth_token", token, { expires: 1 / 24 });
}

export const logOut = () => {
    Cookies.remove("auth_token");
    window.location.href = "/login";
}