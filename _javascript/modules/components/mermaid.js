/**
 * Mermaid-js loader
 */

const MERMAID = 'mermaid';

/*
 * 블로그 팔레트에 맞춘 머메이드 테마.
 * 값의 출처는 _sass/themes/_light.scss, _sass/themes/_dark.scss 와
 * _sass/abstracts/_variables.scss 의 $font-family-base 이다.
 */
const FONT_FAMILY = "'Source Sans Pro', 'Microsoft Yahei', sans-serif";

const LIGHT_VARIABLES = {
  fontFamily: FONT_FAMILY,
  fontSize: '15px',
  background: '#ffffff', // --main-bg
  primaryColor: '#e8f0fa', // --link-color 의 옅은 톤
  primaryBorderColor: '#0056b2', // --link-color
  primaryTextColor: '#34343c', // --text-color
  secondaryColor: '#f3f3f3', // --main-border-color
  secondaryBorderColor: '#c9ccd0',
  secondaryTextColor: '#34343c',
  tertiaryColor: '#fafafa',
  tertiaryBorderColor: '#e9ecef', // --btn-border-color
  tertiaryTextColor: '#34343c',
  mainBkg: '#e8f0fa',
  nodeBorder: '#0056b2',
  lineColor: '#757575', // --text-muted-color
  textColor: '#34343c',
  titleColor: '#2a2a2a', // --heading-color
  edgeLabelBackground: '#ffffff',
  clusterBkg: '#fafafa',
  clusterBorder: '#e9ecef',
  noteBkgColor: '#fff8e1',
  noteBorderColor: '#e0c97f',
  noteTextColor: '#34343c'
};

const DARK_VARIABLES = {
  fontFamily: FONT_FAMILY,
  fontSize: '15px',
  background: 'rgb(27, 27, 30)', // --main-bg
  primaryColor: '#22303f', // --link-color 의 어두운 톤
  primaryBorderColor: 'rgb(138, 180, 248)', // --link-color
  primaryTextColor: 'rgb(175, 176, 177)', // --text-color
  secondaryColor: 'rgb(44, 45, 45)', // --main-border-color
  secondaryBorderColor: '#4a4b4d',
  secondaryTextColor: 'rgb(175, 176, 177)',
  tertiaryColor: '#1e1e1e', // --button-bg
  tertiaryBorderColor: '#2e2f31', // --btn-border-color
  tertiaryTextColor: 'rgb(175, 176, 177)',
  mainBkg: '#22303f',
  nodeBorder: 'rgb(138, 180, 248)',
  lineColor: '#868686', // --text-muted-color
  textColor: 'rgb(175, 176, 177)',
  titleColor: '#cccccc', // --heading-color
  edgeLabelBackground: 'rgb(27, 27, 30)',
  clusterBkg: '#1e1e1e',
  clusterBorder: '#2e2f31',
  noteBkgColor: '#33302a',
  noteBorderColor: '#5c5241',
  noteTextColor: 'rgb(175, 176, 177)'
};

// 'base' 테마에서만 themeVariables 가 온전히 반영된다
const configMapper = Theme.getThemeMapper(
  { theme: 'base', themeVariables: LIGHT_VARIABLES },
  { theme: 'base', themeVariables: DARK_VARIABLES }
);

function refreshTheme(event) {
  if (event.source === window && event.data && event.data.id === Theme.ID) {
    // Re-render the SVG › <https://github.com/mermaid-js/mermaid/issues/311#issuecomment-332557344>
    const mermaidList = document.getElementsByClassName(MERMAID);

    [...mermaidList].forEach((elem) => {
      const svgCode = elem.previousSibling.children.item(0).textContent;
      elem.textContent = svgCode;
      elem.removeAttribute('data-processed');
    });

    mermaid.initialize(configMapper[Theme.visualState]);
    mermaid.init(null, `.${MERMAID}`);
  }
}

function setNode(elem) {
  const svgCode = elem.textContent;
  const backup = elem.parentElement;
  backup.classList.add('d-none');
  // Create mermaid node
  const mermaid = document.createElement('pre');
  mermaid.classList.add(MERMAID);
  const text = document.createTextNode(svgCode);
  mermaid.appendChild(text);
  backup.after(mermaid);
}

export function loadMermaid() {
  if (
    typeof mermaid === 'undefined' ||
    typeof mermaid.initialize !== 'function'
  ) {
    return;
  }

  const basicList = document.getElementsByClassName('language-mermaid');
  [...basicList].forEach(setNode);

  mermaid.initialize(configMapper[Theme.visualState]);

  if (Theme.switchable) {
    window.addEventListener('message', refreshTheme);
  }
}
