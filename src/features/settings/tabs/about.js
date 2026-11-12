import {
  AUTHOR_AVATAR_URL,
  AUTHOR_EMAIL,
  AUTHOR_HANDLE,
  AUTHOR_NAME,
  AUTHOR_URL,
  REPO_URL,
  SCRIPT_VERSION,
} from '../../../core/constants.js';
import { t } from '../../../i18n/index.js';
import { el } from '../../../utils/dom.js';

function link(className, href, text) {
  const a = el('a', className, text);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

/** Honest answer to “what does this script send, and where?”. */
const NETWORK_KEYS = [
  'about.networkTranslate',
  'about.networkCustom',
  'about.networkMedia',
  'about.networkLocal',
  'about.networkUpdate',
  'about.networkConnect',
];

function networkBlock() {
  const wrap = el('section', 'xp-about__network');
  wrap.appendChild(el('h3', 'xp-about__networkTitle', t('about.networkTitle')));
  const list = el('ul', 'xp-about__networkList');
  for (const key of NETWORK_KEYS) list.appendChild(el('li', 'xp-about__networkItem', t(key)));
  wrap.appendChild(list);
  return wrap;
}

function render() {
  const root = el('div', 'xp-about');
  root.appendChild(el('p', 'xp-about__desc', t('about.description')));
  root.appendChild(link('xp-about__repo', REPO_URL, t('about.repo')));

  const author = el('div', 'xp-about__author');
  const avatar = el('img', 'xp-about__avatar');
  avatar.src = AUTHOR_AVATAR_URL;
  avatar.alt = '';
  avatar.width = 56;
  avatar.height = 56;
  avatar.decoding = 'async';
  const meta = el('div', 'xp-about__meta');
  meta.append(link('xp-about__name', AUTHOR_URL, AUTHOR_NAME));
  if (AUTHOR_HANDLE && AUTHOR_HANDLE !== AUTHOR_NAME) {
    meta.appendChild(el('span', 'xp-about__handle', `@${AUTHOR_HANDLE}`));
  }
  if (AUTHOR_EMAIL) {
    meta.appendChild(link('xp-about__email', `mailto:${AUTHOR_EMAIL}`, AUTHOR_EMAIL));
  }
  author.append(avatar, meta);
  root.appendChild(author);

  root.appendChild(networkBlock());

  root.appendChild(el('p', 'xp-about__foot', `${t('about.license')} · v${SCRIPT_VERSION}`));
  return root;
}

export const aboutTab = {
  id: 'about',
  titleKey: 'about.title',
  render,
};
