// .github/scripts/generate_accomplishments.js

// 1) Pull in Node’s built‑in FS and Octokit via CommonJS:
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

async function run() {
  // 2) Figure out the repo owner & name from the environment
  const [owner] = process.env.GITHUB_REPOSITORY.split('/');
  const repo = 'accomplishments';

  // 3) Instantiate Octokit with the Action’s GITHUB_TOKEN
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // 4) Fetch all issues labeled "accomplishment"
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: 'accomplishment',
    state: 'all',
    per_page: 100
  });

  // 5) Build a Markdown table out of them
  const rows = issues.map(i => {
    const date = new Date(i.created_at)
      .toLocaleString('default',{month:'short',year:'numeric'});
    const title = i.title.replace(/^\[.*?\]\s*–\s*/, '').trim();
    const desc = (i.body.split('\n').find(l => l.trim()) || '').trim();
    return `| ${date} | [${title}](${i.html_url}) | ${desc} |`;
  });

  const table = [
    '| Date | Milestone | Description |',
    '| ---- | --------- | ----------- |',
    ...rows
  ].join('\n');

  // 6) Inject it under your magic comment in README.md
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
