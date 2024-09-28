import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getSession, commitSession, destroySession } from '../session';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const newSession = await getSession();
  await destroySession(session);
  newSession.flash('success', 'サインアウトしました');
  return redirect('/signin', {
    headers: {
      'Set-Cookie': await commitSession(newSession),
    },
  });
}
