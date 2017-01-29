import {Client} from 'nes/client';

export default store => {
  const url = store.getState().get('presenceServerUrl');


  if (url) {
    const ws = new Client(url, {
      timeout: 10000
    });

    ws.connect(err => {
      if (err) {
        throw err;
      }

      ws.subscribe(
        '/item/5',
        (message, flags) => console.log(message, flags),
        (err) => console.error(err)
      );
    });

    return next => action => {
      return next(action);
    };
  }

  return next => action => {
    return next(action);
  };
}
