import { createCookieSessionStorage } from '@remix-run/node'; // or cloudflare/deno

export type SessionData = {
  baseDn: string;
  userName: string;
  password: string;
  authorized: boolean;
  toastMessage: string;
  toastType: string;
};

export type SessionFlashData = {
  success: string;
  error: string;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: '__adcon_session',
    httpOnly: true,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env['ADCON_SESSION_SECRET'] as string],
    secure: true,
  },
});

export { getSession, commitSession, destroySession };
