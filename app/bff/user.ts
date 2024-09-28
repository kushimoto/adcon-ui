import { getSession } from '~/session';
import { address } from '~/settings';
import { backendFetch } from '~/utilities/backendFetch';
import { toast } from '~/utilities/toast';

export async function getUser(request: Request): Promise<Response> {
  const session = await getSession(request.headers.get('Cookie'));
  const userName = session.get('userName');
  const baseDn = session.get('baseDn');

  const user = await backendFetch({
    method: 'GET',
    endpoint: '/User',
    queryData: {
      UserName: `${userName}`,
      protocol: 'LDAP',
      address: address,
      baseDn: `${baseDn}`,
    },
  });

  return user;
}

export async function updateUser(request: Request): Promise<Response> {
  const session = await getSession(request.headers.get('Cookie'));
  const form = await request.formData();
  const sshPublicKeysString = form.get('sshPublicKeys')?.toString() ?? '';
  const data: Record<string, string | string[]> = {};
  data.protocol = 'LDAP';
  data.address = address;
  data.baseDn = session.get('baseDn') ?? '';
  data.adminName = session.get('userName') ?? '';
  data.adminPass = session.get('password') ?? '';
  data.userName = session.get('userName') ?? '';
  data.userPass = session.get('password') ?? '';
  data.userNewPass = form.get('newPassword')?.toString() ?? '';
  data.displayName = form.get('username')?.toString() ?? '';
  data.mail = form.get('mail')?.toString() ?? '';
  data.sshPublicKeys = sshPublicKeysString.split(',');

  const result = await backendFetch({
    method: 'PUT',
    endpoint: '/User',
    bodyData: data,
  });

  if (result.status === 204) {
    return toast({ request: request, message: '更新が完了しました', messageType: 'success' });
  } else {
    return toast({ request: request, message: await result.text(), messageType: 'error' });
  }
}
