import http from 'node:http';
import crypto from 'node:crypto';
import os from 'node:os';
import open from 'open';

export interface AuthResult {
  runtimeId: string;
  apiKey: string;
}

const TIMEOUT_MS = 5 * 60 * 1000;

export async function runBrowserAuth(platformUrl: string): Promise<AuthResult> {
  const state = crypto.randomBytes(32).toString('hex');

  return new Promise<AuthResult>((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      finish(() => reject(new Error('Timed out waiting for browser authentication (5 minutes).')));
    }, TIMEOUT_MS);

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }

      const receivedState = url.searchParams.get('state');
      const code = url.searchParams.get('code');

      if (receivedState !== state || !code) {
        res.writeHead(400, { 'Content-Type': 'text/html' }).end(
          '<html><body>Invalid or stale auth callback. Close this tab and run <code>thinkthroo setup</code> again.</body></html>'
        );
        finish(() => reject(new Error('Received an invalid or stale auth callback.')));
        return;
      }

      redeemCode(platformUrl, code)
        .then((result) => {
          res.writeHead(200, { 'Content-Type': 'text/html' }).end(
            '<html><body>You’re all set — return to your terminal.</body></html>'
          );
          finish(() => resolve(result));
        })
        .catch((err) => {
          res.writeHead(500, { 'Content-Type': 'text/html' }).end(
            '<html><body>Failed to complete setup. Return to your terminal for details.</body></html>'
          );
          finish(() => reject(err));
        });
    });

    function finish(action: () => void): void {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      server.close();
      action();
    }

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        finish(() => reject(new Error('Failed to bind loopback server.')));
        return;
      }

      const redirectUri = `http://127.0.0.1:${address.port}/callback`;
      const authUrl = new URL('/cli-auth', platformUrl);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('name', os.hostname());

      open(authUrl.toString()).catch(() => {
        // Fall back to printing the URL — open() can fail in headless/SSH environments.
      });
      console.log('If your browser did not open automatically, visit:');
      console.log(authUrl.toString());
    });

    server.on('error', (err) => {
      finish(() => reject(err));
    });
  });
}

async function redeemCode(platformUrl: string, code: string): Promise<AuthResult> {
  const res = await fetch(`${platformUrl}/api/daemon/cli-auth/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(`Failed to redeem auth code: ${err.error ?? res.status}`);
  }

  return res.json() as Promise<AuthResult>;
}
