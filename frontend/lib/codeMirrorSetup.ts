import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/idea.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import codemirror from 'codemirror';

export const LANGUAGE = 'python';
export const THEME = 'idea';

export const responsiveEditorHeight = (editor: codemirror.Editor) =>
  editor.setSize(null, 'auto');
