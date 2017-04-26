
export function getTasksState (dom, top) {
  if (dom === top) {
    return {
      time: 0,
      header: '',
      tasks: []
    }
  }
  // parse time
  const time = parseInt(dom.getAttribute('time'), 10)
  // parse tasks list
  const tasks = getTasks(dom.querySelectorAll('li'));
  // remove tasks
  [].map.call(dom.querySelectorAll('ol'), el => el.parentNode.removeChild(el));
  [].map.call(dom.querySelectorAll('ul'), el => el.parentNode.removeChild(el))

  let footer = dom.querySelector('footer')
  if (footer) {
    footer.parentNode.removeChild(footer)
    footer = footer.innerHTML
  }

  // take the whole element
  const header = dom.innerHTML

  return {
    time: isNaN(time) ? 30 : time,
    header,
    footer,
    tasks
  }
}

function getTasks (elems) {
  return [].map.call(elems, task => {
    const type = (task.getAttribute('class') || '').replace('xp-', '')
    const content = task.innerHTML

    return { type, content }
  })
}
