import fs from 'fs';

let content = fs.readFileSync('src/components/auth/AuthClient.tsx', 'utf8');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

const oldSwitch = `  const switchView = (view: AuthView) => {
    setActiveView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(\`/auth?\${params.toString()}\`);
  };`;

content = content.replace(oldSwitch, '');

const insertTarget = `  const [isForgotPending, startForgotTransition] = useTransition();`;

const newSwitch = `  const [isForgotPending, startForgotTransition] = useTransition();

  const switchView = (view: AuthView) => {
    setActiveView(view);
    if (view === 'register') {
      setRegSuccess(null);
      setRegError(null);
    }
    if (view === 'login') {
      setLoginError(null);
    }
    if (view === 'forgot-password') {
      setForgotSuccess(null);
      setForgotError(null);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(\`/auth?\${params.toString()}\`);
  };`;

if (!content.includes(insertTarget)) {
  console.error('Target not found in AuthClient.tsx');
  process.exit(1);
}

content = content.replace(insertTarget, newSwitch);

// Convert back to CRLF
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/auth/AuthClient.tsx', content, 'utf8');
console.log('Successfully updated switchView in src/components/auth/AuthClient.tsx');

