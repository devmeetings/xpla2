
export function getRunServerUrl (dom) {
  const runUrl = dom.getAttribute('xp-run-server-url')
  if (!runUrl) {
    throw new Error('Specify xp-run-server-url attribute on html!')
  }
  return runUrl
}
