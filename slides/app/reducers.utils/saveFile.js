// @flow

export function saveFile (content: string, fileName: string, type: string = 'application/html') {
  const blob = new Blob([content], { type })
  saveBlob(blob, fileName)
}
export function saveBlob (blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName

  const body = document.body
  if (body) {
    body.appendChild(a)
    a.click()
    body.removeChild(a)
  }
  window.URL.revokeObjectURL(url)
}
