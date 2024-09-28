import { redirect } from '@remix-run/node';
import { commitSession, getSession, SessionData, SessionFlashData } from '~/session';
import type { Session } from '@remix-run/node'; // or cloudflare/deno

export interface toastProps {
  request: Request;
  message: string;
  messageType: string;
  defaultSession?: Session<SessionData, SessionFlashData>;
}

export async function toast(props: toastProps) {
  const { request, message, messageType, defaultSession } = props;
  const session =
    defaultSession === undefined ? await getSession(request.headers.get('Cookie')) : defaultSession;
  session.set('toastMessage', message);
  session.set('toastType', messageType);
  if (messageType === 'success') {
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } else {
    return redirect('/signin', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
}
