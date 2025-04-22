// .github/scripts/generate_accomplishments.js
import { writeFileSync, readFileSync } from 'fs';
import { Octokit } from '@octokit/rest';

const [owner] = process.env.GITHUB_REPOSITORY.split('/');
const repo = 'accomplishments';
const octokit = new Octokit();

async function run() {
  // 1) fetch all issues labeled "accomplishment"
  const { data: issues } = await octokit.issues.listForRepo({
    owner, repo,
    labels: 'accomplishment',
    state: 'all',
    per_page: 100
  });

  // 2) build markdown table
  const rows = issues.map(i => {
    const date = new Date(i.created_at)
      .toLocaleString('default',{month:'short',year:'numeric'});
    const title = i.title.replace(/^\[.*?\]\s*–\s*/, '');
    const desc  = i.body.split('\n')[0];
    return `| ${date} | [${title}](${i.html_url}) | ${desc} |`;
  });

  const table = [
    '| Date | Milestone | Description |',
    '| ---- | --------- | ----------- |',
    ...rows
  ].join('\n');

  // 3) insert into README.md
  const path = 'README.md';
  const readme = readFileSync(path, 'utf8');
  const updated = readme.replace(
    /<!-- ACME:accomplishments-table -->[\s\S]*?(\r?\n|$)/,
    `<!-- ACME:accomplishments-table -->\n\n${table}\n`
  );
  writeFileSync(path, updated, 'utf8');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
