import { TextInput, PasswordInput, Paper, Title, Container, Button } from '@mantine/core';
import { redirect } from '@remix-run/node';
import { getSession, commitSession } from '~/session';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { useForm } from '@mantine/form';
import { Authentication } from '~/bff/auth';
import { toast } from '~/utilities/toast';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.get('authorized') === true) {
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return null;
}

export default function Signin() {
  const form = useForm({
    initialValues: {
      adminName: '',
      adminPass: '',
      baseDn: '',
    },
  });

  return (
    <Container size={420} my={40}>
      <Title order={3} ta="center">
        WEBでADいじっ太郎
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Form method="POST">
          <TextInput
            label="ベースDN"
            name="baseDn"
            placeholder="ou=unko,dc=local,dc=example,dc=com"
            required
            {...form.getInputProps('baseDn')}
          />
          <TextInput
            label="ユーザ名"
            name="userName"
            required
            mt="md"
            {...form.getInputProps('adminName')}
          />
          <PasswordInput
            label="パスワード"
            name="password"
            required
            mt="md"
            {...form.getInputProps('adminPass')}
          />
          <Button fullWidth mt="xl" type="submit">
            サインイン
          </Button>
        </Form>
      </Paper>
    </Container>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const result = await Authentication(request);
  return result;
}
