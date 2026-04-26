import { createContext, useContext, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("applyvault_user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("applyvault_token"));

    const login = async ({ email, password }) => {
        const { data } = await api.post("/auth/login", { email, password });

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("applyvault_user", JSON.stringify(data.user));
        localStorage.setItem("applyvault_token", data.token);

        return data.user;
    };

    const registerCandidate = async ({ name, email, password }) => {
        const { data } = await api.post("/auth/register", { name, email, password });

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("applyvault_user", JSON.stringify(data.user));
        localStorage.setItem("applyvault_token", data.token);

        return data.user;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("applyvault_user");
        localStorage.removeItem("applyvault_token");
    };

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            login,
            registerCandidate,
            logout
        }),
        [user, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};
