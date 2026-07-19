import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, it, expect } from 'vitest';
import KindTag from '@components/notebook/KindTag.astro';
import CrossTag from '@components/notebook/CrossTag.astro';
import ThreadCard from '@components/notebook/ThreadCard.astro';
import StreamRow from '@components/notebook/StreamRow.astro';
import ThreadPieceRow from '@components/notebook/ThreadPieceRow.astro';
import ProjectRow from '@components/notebook/ProjectRow.astro';
import NowRow from '@components/notebook/NowRow.astro';
import Breadcrumb from '@components/notebook/Breadcrumb.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('KindTag', () => {
  it('maps a kind slug to its display label', async () => {
    const html = await container.renderToString(KindTag, { props: { kind: 'buildlog' } });
    expect(html).toContain('build-log');
    expect(html).toContain('class="k');
  });

  it('merges a consumer-supplied class (class-merge-safe)', async () => {
    const html = await container.renderToString(KindTag, { props: { kind: 'essay', class: 'extra-cls' } });
    expect(html).toContain('extra-cls');
    expect(html).toContain('essay');
  });
});

describe('CrossTag', () => {
  it('defaults to the boxed .xtag variant', async () => {
    const html = await container.renderToString(CrossTag, { slots: { default: 'also Systems' } });
    expect(html).toContain('class="xtag');
    expect(html).toContain('also Systems');
  });

  it('renders the italic .xbadge variant when asked', async () => {
    const html = await container.renderToString(CrossTag, {
      props: { variant: 'badge' },
      slots: { default: 'also applied AI' },
    });
    expect(html).toContain('class="xbadge');
  });
});

describe('ThreadCard', () => {
  it('renders num, title, description, meta and the href', async () => {
    const html = await container.renderToString(ThreadCard, {
      props: {
        href: '/threads/applied-ai',
        num: '/01',
        title: 'Applied AI & ML',
        description: 'Shipping model-backed features.',
        meta: '9 pieces · 3 shipped',
      },
    });
    expect(html).toContain('href="/threads/applied-ai"');
    expect(html).toContain('/01');
    expect(html).toContain('Applied AI &amp; ML');
    expect(html).toContain('Shipping model-backed features.');
    expect(html).toContain('9 pieces');
  });
});

describe('StreamRow', () => {
  it('renders the date, title, kind label and href', async () => {
    const html = await container.renderToString(StreamRow, {
      props: { href: '/writing/x', date: '02 Jun', title: 'A Durable Lambda Pattern', kind: 'buildlog' },
    });
    expect(html).toContain('href="/writing/x"');
    expect(html).toContain('02 Jun');
    expect(html).toContain('A Durable Lambda Pattern');
    expect(html).toContain('build-log');
  });
});

describe('ThreadPieceRow', () => {
  it('renders a cross-list chip when `cross` is set', async () => {
    const html = await container.renderToString(ThreadPieceRow, {
      props: { href: '/writing/x', date: '12 May', title: 'S3 Vectors', cross: 'also Applied AI' },
    });
    expect(html).toContain('also Applied AI');
    expect(html).toContain('class="xtag');
  });

  it('omits the chip when `cross` is absent', async () => {
    const html = await container.renderToString(ThreadPieceRow, {
      props: { href: '/writing/x', date: '04 Apr', title: 'A Durable Lambda Pattern' },
    });
    expect(html).not.toContain('xtag');
  });
});

describe('ProjectRow', () => {
  it('joins an array tech stack and renders the status', async () => {
    const html = await container.renderToString(ProjectRow, {
      props: { title: 'Skopia', href: '/projects/skopia', tech: ['TypeScript', 'Workers', 'D1'], status: 'shipped' },
    });
    expect(html).toContain('TypeScript · Workers · D1');
    expect(html).toContain('shipped');
    expect(html).toContain('href="/projects/skopia"');
  });
});

describe('NowRow', () => {
  it('renders the label and slotted text', async () => {
    const html = await container.renderToString(NowRow, {
      props: { label: 'Building' },
      slots: { default: 'Evals and continual learning, on the side.' },
    });
    expect(html).toContain('Building');
    expect(html).toContain('Evals and continual learning, on the side.');
  });
});

describe('Breadcrumb', () => {
  it('links every crumb but the last, which is aria-current', async () => {
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [{ label: 'Threads', href: '/threads' }, { label: 'Systems & infrastructure' }],
      },
    });
    expect(html).toContain('href="/threads"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Systems &amp; infrastructure');
  });
});
