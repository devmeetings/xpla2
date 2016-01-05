export function saveFile (content, fileName) {
  const blob = new Blob([content], {
    type: 'application/html'
  });
  saveBlob(blob, fileName);
}
export function saveBlob (blob, fileName) {
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
