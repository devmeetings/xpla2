
export function getTasksState (dom) {
  // parse time
  const time = parseInt(dom.getAttribute('time'), 10);
  // parse tasks list
  const tasks = getTasks(dom.querySelectorAll('li'));
  // remove tasks
  [].map.call(dom.querySelectorAll('ol'), li => li.parentNode.removeChild(li));
  [].map.call(dom.querySelectorAll('ul'), li => el.parentNode.removeChild(el));

  // take the whole element
  const header = dom.innerHTML;

  return {
    time: isNaN(time) ? 30 : time,
    header, tasks
  };
}

function getTasks(elems) {
  return [].map.call(elems, task => {
    const type = (task.getAttribute('class') || '').replace('xp-', '');
    const content = task.textContent;

    return { type, content };
  });
}
