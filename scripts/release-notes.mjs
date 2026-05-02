import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const SECTION_ORDER = [
    ['feat', 'Added'],
    ['fix', 'Fixed'],
    ['update', 'Updated'],
    ['remove', 'Removed'],
];

function getCommitRange() {
    try {
        const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        return `${lastTag}..HEAD`;
    } catch {
        return 'HEAD~20..HEAD';
    }
}

function parseCommitLine(line) {
    const match = line.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
    if (!match) {
        return { section: 'Misc', text: line };
    }

    const [, type, scope, subject] = match;
    const section = SECTION_ORDER.find(([prefix]) => prefix === type)?.[1] ?? 'Misc';
    const label = scope ? `${subject} (${scope})` : subject;
    return { section, text: label };
}

export function buildReleaseNotes(rawLog) {
    const commits = rawLog
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(parseCommitLine);

    const buckets = new Map();
    for (const { section, text } of commits) {
        if (!buckets.has(section)) buckets.set(section, []);
        buckets.get(section).push(text);
    }

    const orderedSections = [
        ...SECTION_ORDER.map(([, section]) => section),
        'Misc',
    ];

    const lines = [];
    for (const section of orderedSections) {
        const items = buckets.get(section);
        if (!items?.length) continue;
        lines.push(`## ${section}`);
        for (const item of items) {
            lines.push(`- ${item}`);
        }
        lines.push('');
    }

    return lines.length ? lines.join('\n').trim() + '\n' : '## Misc\n- No changelog entries found.\n';
}

export function getReleaseNotes() {
    const range = getCommitRange();
    const raw = execSync(`git log --reverse --pretty=format:%s ${range}`, { encoding: 'utf8' });
    return buildReleaseNotes(raw);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    process.stdout.write(getReleaseNotes());
}
