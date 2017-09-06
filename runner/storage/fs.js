
const fs = require('fs');
const DB_PATH = './db';
const SAVE_DEFER = 10000;

function path (name) {
  return `${DB_PATH}/${name}`;
}

function loadDb (name) {
  try {
    if (!fs.existsSync(path(name))) {
      return [{}, []];
    }
    const [mem, memIds] = JSON.parse(fs.readFileSync(path(name), 'utf8'));
    return [mem, memIds];
  } catch (err) {
    console.warn(`Error reading database ${name}`, err);
    return [{}, []];
  }
}

const saveDeferred = {};
const dataToWrite = {};
const saving = {};

function saveDb (name, mem, memIds) {
  dataToWrite[name] = [mem, memIds];
  if (saveDeferred[name]) {
    return;
  }

  // Defer save
  saveDeferred[name] = true;
  setTimeout(function saveNow () {
    if (saving[name]) {
      saving[name] = 2;
      return;
    }

    // Reset the state
    saveDeferred[name] = false;
    saving[name] = 1;

    try {
      const serialized = JSON.stringify(dataToWrite[name]);
      delete dataToWrite[name];
      fs.writeFile(path(name), serialized, 'utf8', (err) => {
        if (err) {
          console.warn(`Error writing database ${name}`, err);
        }

        const prev = saving[name];
        saving[name] = 0;

        // Another save wanted to be conducted in the middle.
        if (prev === 2) {
          saveNow();
        }
      });
    } catch (err) {
      saving[name] = false;
      console.error(`Error serializing data for database ${name}`, err);
    }
  }, SAVE_DEFER);
}

module.exports = { loadDb, saveDb };
