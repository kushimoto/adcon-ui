import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'WEBでADいじっ太郎' }, { name: 'description', content: 'Welcome to Remix!' }];
};

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from '@remix-run/react';
import {
  Center,
  ColorSchemeScript,
  MantineProvider,
  Stack,
  Tooltip,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { getSession, commitSession } from './session';
import { json, redirect } from '@remix-run/node';
import { useEffect, useState } from 'react';
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconCalendarStats,
  IconUser,
  IconSettings,
  IconLogout,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import classes from './css/Root.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home', pathname: '/' },
  // { icon: IconGauge, label: 'Dashboard' },
  // { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  // { icon: IconCalendarStats, label: 'Releases' },
  // { icon: IconUser, label: 'Account' },
  // { icon: IconFingerprint, label: 'Security' },
  // { icon: IconSettings, label: 'Settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {
        setActive(index);
        navigate(link.pathname);
      }}
    />
  ));

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          {location.pathname !== '/signin' && (
            <nav className={classes.navbar}>
              <Center>
                <img src="logo.webp" height="40rem" />
              </Center>
              <div className={classes.navbarMain}>
                <Stack justify="center" gap={0}>
                  {links}
                </Stack>
              </div>
              <Stack justify="center" gap={0}>
                <NavbarLink icon={IconLogout} label="Logout" onClick={() => navigate('/signout')} />
              </Stack>
            </nav>
          )}
          {children}

          <Notifications />
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const flash = {
    success: session.get('success'),
    error: session.get('error'),
  };
  const toast = {
    message: session.get('toastMessage'),
    type: session.get('toastType'),
  };
  const url = new URL(request.url).pathname;

  if (url !== '/signin' && session.get('authorized') !== true) {
    session.set('authorized', false);
    return redirect('/signin', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  session.set('toastMessage', '');
  session.set('toastType', '');

  return json(
    {
      flash,
      toast,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
}

export default function App() {
  const { flash, toast } = useLoaderData<typeof loader>();
  let ignore = false;

  useEffect(() => {
    if (ignore) return;

    if (toast.message?.length ?? 0 > 0) {
      notifications.show({
        title: toast.type === 'success' ? '成功' : toast.type === 'error' ? '失敗' : '通知',
        message: toast.message,
        color: toast.type === 'success' ? 'teal' : toast.type === 'error' ? 'red' : 'blue',
      });
    }
    if ([typeof flash.success, typeof flash.error].includes('string')) {
      notifications.show({
        title: typeof flash.success === 'string' ? '成功' : '失敗',
        message: typeof flash.success === 'string' ? flash.success : flash.error,
        color: typeof flash.success === 'string' ? 'teal' : 'red',
      });
    }
    return () => {
      ignore = !ignore;
    };
  }, [toast, flash]);

  return <Outlet />;
}
