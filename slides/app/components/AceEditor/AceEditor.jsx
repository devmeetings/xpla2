import ace from 'brace';
import React from 'react';

const Range = ace.acequire('ace/range').Range;

export function createEditSession (content, mode, highlight) {
  const editSession = ace.createEditSession(content, `ace/mode/${mode}`);

  if (highlight.length) {
    // add markers
    highlight.map((pattern) => {
      const range = new Range(pattern.from, 0, pattern.to, Infinity);
      editSession.addMarker(range, 'ace_highlight-line', 'xp-highlight');
    });
  }

  return editSession;
}

export class AceEditor extends React.Component {

  constructor (...props) {
    super(...props);
    this.name = Math.random();
  }

  onChange () {
    if (this.props.onChange && !this.silent) {
      var value = this.editor.getValue();
      this.props.onChange(value);
    }
  }

  onFocus () {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  onBlur () {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }
  onCopy (text) {
    if (this.props.onCopy) {
      this.props.onCopy(text);
    }
  }
  onPaste (text) {
    if (this.props.onPaste) {
      this.props.onPaste(text);
    }
  }
  componentDidMount () {
    this.editor = ace.edit(this.props.name + this.name);
    if (this.props.onBeforeLoad) {
      this.props.onBeforeLoad(ace);
    }

    var editorProps = Object.keys(this.props.editorProps);
    for (var i = 0; i < editorProps.length; i++) {
      this.editor[editorProps[i]] = this.props.editorProps[editorProps[i]];
    }

    if (this.props.mode) {
      this.editor.getSession().setMode('ace/mode/' + this.props.mode);
    }

    this.editor.$blockScrolling = Infinity;
    this.editor.setTheme('ace/theme/' + this.props.theme);
    this.editor.setFontSize(this.props.fontSize);
    if (this.props.value !== undefined) {
      this.editor.setValue(this.props.value, this.props.cursorStart);
    }
    this.editor.getSession().setUseWrapMode(this.props.wrapEnabled);
    this.editor.renderer.setShowGutter(this.props.showGutter);
    this.editor.setOption('maxLines', this.props.maxLines);
    this.editor.setOption('readOnly', this.props.readOnly);
    this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
    this.editor.setOption('tabSize', this.props.tabSize);
    this.editor.setShowPrintMargin(this.props.showPrintMargin);
    this.editor.on('focus', this.onFocus.bind(this));
    this.editor.on('blur', this.onBlur.bind(this));
    this.editor.on('copy', this.onCopy.bind(this));
    this.editor.on('paste', this.onPaste.bind(this));
    this.editor.on('change', this.onChange.bind(this));

    if (this.props.session) {
      this.editor.setSession(this.props.session);
    }

    if (this.props.commands) {
      this.props.commands.map((action) => {
        this.editor.commands.addCommand(action);
      });
    }

    if (this.props.keyboardHandler) {
      this.editor.setKeyboardHandler('ace/keyboard/' + this.props.keyboardHandler);
    }

    if (this.props.onLoad) {
      this.props.onLoad(this.editor);
    }
    this.editor.resize();
    this.editor.focus();
  }

  componentWillUnmount () {
    this.editor = null;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.theme !== this.props.theme) {
      this.editor.setTheme('ace/theme/' + nextProps.theme);
    }
    if (nextProps.fontSize !== this.props.fontSize) {
      this.editor.setFontSize(nextProps.fontSize);
    }
    if (nextProps.maxLines !== this.props.maxLines) {
      this.editor.setOption('maxLines', nextProps.maxLines);
    }
    if (nextProps.readOnly !== this.props.readOnly) {
      this.editor.setOption('readOnly', nextProps.readOnly);
    }
    if (nextProps.highlightActiveLine !== this.props.highlightActiveLine) {
      this.editor.setOption('highlightActiveLine', nextProps.highlightActiveLine);
    }
    if (nextProps.tabSize !== this.props.tabSize) {
      this.editor.setOption('tabSize', nextProps.tabSize);
    }
    if (nextProps.showPrintMargin !== this.props.showPrintMargin) {
      this.editor.setShowPrintMargin(nextProps.showPrintMargin);
    }
    if (nextProps.showGutter !== this.props.showGutter) {
      this.editor.renderer.setShowGutter(nextProps.showGutter);
    }
    if (!nextProps.session) {
      if (nextProps.mode !== this.props.mode) {
        this.editor.getSession().setMode('ace/mode/' + nextProps.mode);
      }
      if (this.editor.getValue() !== nextProps.value) {
        // editor.setValue is a synchronous function call, change event is emitted before setValue return.
        this.silent = true;
        this.editor.setValue(nextProps.value, nextProps.cursorStart);
        this.silent = false;
      }
    } else if (nextProps.session !== this.props.session) {
      this.editor.setSession(nextProps.session);
      this.editor.focus();
    }
  }

  render () {
    var divStyle = {
      width: this.props.width,
      height: this.props.height
    };
    var className = this.props.className;
    return (
      <div
        className={className}
        id={this.props.name + this.name}
        style={divStyle}>
      </div>
    );
  }
}

AceEditor.propTypes = {
  mode: React.PropTypes.string,
  theme: React.PropTypes.string,
  name: React.PropTypes.string,
  className: React.PropTypes.string,
  height: React.PropTypes.string,
  width: React.PropTypes.string,
  fontSize: React.PropTypes.number,
  showGutter: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  onCopy: React.PropTypes.func,
  onPaste: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  value: React.PropTypes.string,
  onLoad: React.PropTypes.func,
  onBeforeLoad: React.PropTypes.func,
  maxLines: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  highlightActiveLine: React.PropTypes.bool,
  tabSize: React.PropTypes.number,
  showPrintMargin: React.PropTypes.bool,
  cursorStart: React.PropTypes.number,
  editorProps: React.PropTypes.object,
  keyboardHandler: React.PropTypes.string,
  wrapEnabled: React.PropTypes.bool,
  commands: React.PropTypes.array
};

AceEditor.defaultProps = {
  name: 'brace-editor',
  mode: '',
  theme: '',
  height: '500px',
  width: '500px',
  value: '',
  fontSize: 14,
  showGutter: true,
  onChange: null,
  onPaste: null,
  onLoad: null,
  maxLines: null,
  readOnly: false,
  highlightActiveLine: true,
  showPrintMargin: false,
  tabSize: 2,
  cursorStart: 1,
  editorProps: {},
  wrapEnabled: false
};
