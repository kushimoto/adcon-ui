import { getSession } from '~/session';
import { address } from '~/settings';
import { backendFetch } from '~/utilities/backendFetch';
import { toast } from '~/utilities/toast';

export async function Authentication(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  const form = await request.formData();
  const data: Record<string, string | string[]> = {};
  data.protocol = 'LDAP';
  data.address = address;
  data.adminName = `${form.get('userName')}`;
  data.adminPass = `${form.get('password')}`;
  data.baseDn = `${form.get('baseDn')}`;

  const result = await backendFetch({
    method: 'POST',
    endpoint: '/Auth',
    bodyData: data,
  });

  if (result.status === 204) {
    session.set('baseDn', data.baseDn);
    session.set('userName', data.adminName);
    session.set('password', data.adminPass);
    session.set('authorized', true);
    return toast({
      request: request,
      message: 'サインインしました',
      messageType: 'success',
      defaultSession: session,
    });
  } else {
    session.set('authorized', false);
    return toast({
      request: request,
      message: await result.text(),
      messageType: 'error',
      defaultSession: session,
    });
  }
}
