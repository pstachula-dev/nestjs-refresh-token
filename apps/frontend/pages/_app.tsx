import "../styles/globals.css";
import App, { AppContext, AppProps } from "next/app";
import nookies from "nookies";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { apiClient, getCSRF, postRefresh } from "../modules/auth/auth";
import { createContext, useEffect } from "react";

export type User = {
  id: number;
  email: string;
};

export const SessionContext = createContext<{
  user: User | null;
  isAuth: boolean;
}>({
  user: null,
  isAuth: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  const { accessToken, user, isAuth } = pageProps;

  if (!apiClient.defaults.headers.common["Authorization"]) {
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  }

  useEffect(() => {
    getCSRF();
  }, []);

  return (
    <SessionContext.Provider value={{ user, isAuth }}>
      <Component {...pageProps} />
    </SessionContext.Provider>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const props = await App.getInitialProps(context);
  const { pageProps } = props;
  const { RefreshToken } = nookies.get(context.ctx);

  const propsData: {
    user?: null | JwtPayload | string;
    accessToken?: string | null;
    isAuth: boolean;
  } = {
    user: null,
    accessToken: null,
    isAuth: false,
  };

  if (RefreshToken) {
    try {
      const res = await postRefresh({
        headers: {
          Cookie: `RefreshToken=${RefreshToken}`,
        },
      });
      const { refreshToken, accessToken } = res?.data || {};
      nookies.set(context.ctx, "RefreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      });
      propsData.accessToken = accessToken;
      propsData.isAuth = !!accessToken;
      propsData.user = jsonwebtoken.decode(refreshToken);
    } catch (error) {
      console.error("error refresh token");
    }
  }

  return { pageProps: { ...pageProps, ...propsData } };
};

export default MyApp;
