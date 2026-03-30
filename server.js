require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// GitHub OAuth scopes — 'repo' grants read/write access to repositories
const GITHUB_SCOPES = 'repo user';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Redirect user to GitHub for authorization
app.get('/auth/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${BASE_URL}/auth/github/callback`,
    scope: GITHUB_SCOPES,
    state: Math.random().toString(36).slice(2),
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GitHub redirects back here with a code
app.get('/auth/github/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?error=access_denied');
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${BASE_URL}/auth/github/callback`,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, scope, error: tokenError } = tokenRes.data;

    if (tokenError || !access_token) {
      console.error('Token exchange failed:', tokenError);
      return res.redirect('/?error=token_exchange_failed');
    }

    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    req.session.user = {
      id: userRes.data.id,
      login: userRes.data.login,
      name: userRes.data.name,
      avatar_url: userRes.data.avatar_url,
      html_url: userRes.data.html_url,
    };
    req.session.accessToken = access_token;
    req.session.scopes = scope;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth error:', err.message);
    res.redirect('/?error=oauth_failed');
  }
});

// Protected dashboard page
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const { name, login, avatar_url, html_url } = req.session.user;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dashboard</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <div class="card">
        <img src="${avatar_url}" alt="avatar" class="avatar" />
        <h1>Welcome, ${name || login}!</h1>
        <p>GitHub: <a href="${html_url}" target="_blank">@${login}</a></p>
        <p class="scopes">Authorized scopes: <code>${req.session.scopes}</code></p>
        <a href="/logout" class="btn btn-secondary">Log out</a>
      </div>
    </body>
    </html>
  `);
});

// JSON API — current user
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user, scopes: req.session.scopes });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('WARNING: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set. Copy .env.example to .env and fill in your credentials.');
  }
});
