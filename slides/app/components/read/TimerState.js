
export function getTimerState (dom) {
  const time = parseInt(dom.textContent, 10)

  return {
    time: isNaN(time) ? 5 : time
  }
}
