if (document == document.currentScript.ownerDocument) {
  loadStylesAndScripts(document.currentScript.ownerDocument);
}

function loadStylesAndScripts (document) {
  const styles = `css/slide.$1.css`;
  const script = `js/slide.$1.js`;

  const $style = document.createElement('link');
  $style.rel = 'stylesheet';
  $style.href = findResourcesUrl(document, styles);

  const $script = document.createElement('script');
  $script.defer = true;
  $script.src = findResourcesUrl(document, script);

  const $head = document.querySelector('head');
  $head.appendChild($style);
  $head.appendChild($script);
}

function findResourcesUrl(document, res) {
  var scripts = document.querySelectorAll('script');
  return [].reduce.call(scripts, function(found, script) {
    if (found) {
      return found;
    }
    var src = script.getAttribute('src');
    if (src.indexOf('js/slide_loader') !== -1) {
      return src.replace(/js\/slide_loader\.(.+)\.js/, res);
    }
  }, false) || ('http://xpla.org/static/' + res.replace('$1', process.env.VERSION));
}
