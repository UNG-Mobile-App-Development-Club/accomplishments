// .github/scripts/generate_accomplishments.js
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

async function run() {
  // 1) determine owner & repo
  const [owner] = process.env.GITHUB_REPOSITORY.split('/');
  const repo = 'accomplishments';

  // 2) instantiate Octokit with the built‑in token
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // 3) fetch all issues labeled "accomplishment"
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: 'accomplishment',
    state: 'all',
    per_page: 100
  });

  // 4) build a markdown table
  const rows = issues.map(i => {
    const date = new Date(i.created_at)
      .toLocaleString('default',{month:'short',year:'numeric'});
    const title = i.title.replace(/^\[.*?\]\s*–\s*/, '');
    const desc  = (i.body.split('\n').find(l=>l.trim())||'').trim();
    return `| ${date} | [${title}](${i.html_url}) | ${desc} |`;
  });

  const table = [
    '| Date | Milestone | Description |',
    '| ---- | --------- | ----------- |',
    ...rows
  ].join('\n');

  // 5) insert into README.md
  const readmePath = 'README.md';
  const readme = fs.readFileSync(readmePath, 'utf8');
  const updated = readme.replace(
    /<!-- ACME:accomplishments-table -->[\s\S]*?(?=\r?\n|$)/,
    `<!-- ACME:accomplishments-table -->\n\n${table}\n`
  );
  fs.writeFileSync(readmePath, updated, 'utf8');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
