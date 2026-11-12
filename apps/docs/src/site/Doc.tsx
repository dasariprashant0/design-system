// Changelog and Roadmap pages: the repository's own CHANGELOG.md and docs/ROADMAP.md, read at build time.
import changelog from '../../../../CHANGELOG.md?raw';
import roadmap from '../../../../docs/ROADMAP.md?raw';
import {GITHUB} from '../shell/Topbar';
import {Markdown} from './markdown';

export const Changelog = () => (
  <>
    <p className="prose">Every change to the CSS, the React components and the CLI, newest first. The source is <a href={`${GITHUB}/blob/master/CHANGELOG.md`}>CHANGELOG.md</a>.</p>
    <Markdown source={changelog} label="Changelog" />
  </>
);

export const Roadmap = () => (
  <>
    <p className="prose">This page is <a href={`${GITHUB}/blob/master/docs/ROADMAP.md`}>docs/ROADMAP.md</a>, rendered from the repository. It says where the kit stands today, including what is not done.</p>
    <Markdown source={roadmap} label="Roadmap" />
  </>
);
