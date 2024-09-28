import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Table,
  Modal,
  Group,
  Anchor,
  Textarea,
} from '@mantine/core';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@mantine/form';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { User } from '../types';
import { useDisclosure } from '@mantine/hooks';
import { getUser, updateUser } from '~/bff/user';

export async function loader({ request }: LoaderFunctionArgs) {
  const result = await getUser(request);
  const user: User = await result.json();
  return user;
}
export default function Index() {
  const userData = useLoaderData<typeof loader>();
  const [standardInfoModal, standardInfoModalHandler] = useDisclosure(false);
  const [passwordModal, passwordModalHandler] = useDisclosure(false);
  const [sshPublicKeyModal, sshPublicKeyModalHandler] = useDisclosure(false);

  const fetcher = useFetcher();

  const form = useForm({
    initialValues: {
      username: userData.samAccountName,
      mail: userData.mail,
      sshPublicKeys: userData.sshPublicKeys ?? '',
      passowrd: '',
      newPassword: '',
      retypeNewPassword: '',
    },
  });

  return (
    <Container size={620} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={5}>基本情報</Title>
        <Table mt="md">
          <Table.Tr>
            <Table.Th style={{ textAlign: 'center' }}>ユーザー名</Table.Th>
            <Table.Td>{userData.samAccountName}</Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'center' }}>メールアドレス</Table.Th>
            <Table.Td>{userData.mail ?? '未登録'}</Table.Td>
            <Table.Td>
              <Button size="compact-xs" onClick={standardInfoModalHandler.open}>
                変更
              </Button>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'center' }}>パスワード</Table.Th>
            <Table.Td>見せないぞ ♥</Table.Td>
            <Table.Td>
              <Button size="compact-xs" onClick={passwordModalHandler.open}>
                変更
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table>
      </Paper>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={5}>公開鍵情報</Title>
        <Table mt="md" withColumnBorders>
          <Table.Tbody>
            {userData.sshPublicKeys.map((sshPublicKey: string, index: number) => {
              if (sshPublicKey !== 'null')
                return (
                  <Table.Tr key={index}>
                    <Table.Td maw={60} style={{ overflowWrap: 'break-word' }}>
                      {sshPublicKey}
                    </Table.Td>
                    <Table.Td maw="xs">
                      <Group justify="center">
                        <Button
                          size="compact-xs"
                          color="red"
                          onClick={() => {
                            const sshPublicKeys: string[] = userData.sshPublicKeys.filter(
                              (e: string) => e !== sshPublicKey,
                            );
                            fetcher.submit(
                              {
                                sshPublicKeys: sshPublicKeys.length > 0 ? sshPublicKeys : null,
                              },
                              { method: 'PUT' },
                            );
                          }}
                        >
                          削除
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
            })}
          </Table.Tbody>
        </Table>
        <Group mt="sm" mx="sm" justify="right">
          <Anchor underline="always" onClick={sshPublicKeyModalHandler.open}>
            +新規追加
          </Anchor>
        </Group>
      </Paper>
      <Modal
        opened={standardInfoModal}
        onClose={standardInfoModalHandler.close}
        title="基本情報の変更"
      >
        <Form method="PUT">
          <TextInput
            label="メールアドレス"
            mb="md"
            defaultValue={form.values.mail}
            onChange={e => form.setValues({ mail: e.target.value })}
          />
          <Group justify="right">
            <Button
              size="sm"
              onClick={() => {
                fetcher.submit(form.values, { method: 'PUT' });
                form.reset();
                standardInfoModalHandler.close();
              }}
            >
              確定
            </Button>
          </Group>
        </Form>
      </Modal>
      <Modal opened={passwordModal} onClose={passwordModalHandler.close} title="パスワード変更">
        <PasswordInput
          mb="sm"
          label="新しいパスワード"
          onChange={e => form.setFieldValue('newPassword', e.target.value)}
        />
        <PasswordInput
          mb="sm"
          label="確認のためもう一度入力"
          onChange={e => form.setFieldValue('retypeNewPassword', e.target.value)}
        />
        <Group justify="right">
          <Button
            size="sm"
            onClick={() => {
              if (form.values.newPassword === form.values.retypeNewPassword) {
                fetcher.submit(form.values, { method: 'PUT' });
                form.reset();
              }
              passwordModalHandler.close();
            }}
          >
            確定
          </Button>
        </Group>
      </Modal>
      <Modal opened={sshPublicKeyModal} onClose={sshPublicKeyModalHandler.close} title="公開鍵🔒">
        <Textarea
          mb="sm"
          onChange={e =>
            form.setValues({ sshPublicKeys: [e.target.value, ...userData.sshPublicKeys] })
          }
        />
        <Group justify="right">
          <Button
            size="sm"
            onClick={() => {
              fetcher.submit(form.values, { method: 'PUT' });
              form.reset();
              sshPublicKeyModalHandler.close();
            }}
          >
            確定
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  return await updateUser(request);
}
