import fs from 'fs';
import { Octokit } from '@octokit/rest';

async function run() {
  // Get repository owner from environment
  const [owner] = process.env.GITHUB_REPOSITORY.split('/');
  const repo = 'accomplishments';

  // Initialize Octokit with token
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Fetch all "accomplishment" issues
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: 'accomplishment',
    state: 'all',
    per_page: 100
  });

  // Build Markdown table rows
  const rows = issues.map(issue => {
    const date = new Date(issue.created_at)
      .toLocaleString('default', { month: 'short', year: 'numeric' });
    const title = issue.title.replace(/^\[.*?\]\s*–\s*/, '').trim();
    const desc = (issue.body.split('\n').find(line => line.trim()) || '').trim();
    return `| ${date} | [${title}](${issue.html_url}) | ${desc} |`;
  });

  // Construct full table
  const table = [
    '<!-- ACME:accomplishments-table -->\n',
    '| Date | Milestone | Description |',
    '| ---- | --------- | ----------- |',
    ...rows,
    '\n'
  ].join('\n');

  // Update README
  const readmePath = 'README.md';
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const updatedContent = readmeContent.replace(
    /<!-- ACME:accomplishments-table -->[\s\S]*?<!-- ACME:end -->/,
    table
  );
  
  fs.writeFileSync(readmePath, updatedContent, 'utf8');
}

run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});