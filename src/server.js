import Server from 'socket.io';

export default function startServer(store) {
  const io = new Server().attach(8090);

  store.subscribe(() => {
    // this is where we'd emit updated state to clients.
    console.log('Hooray! Redux state updated!');
  });

  io.on('connection', (socket) => {
    console.log('Accepted connection');

    const dispatch = (action) => {
      console.log('action received from websocket: ${JSON.stringify(action)}');

      // XXX do some sort of validation - no?
      store.dispatch(action);
    };

    socket.on('action', dispatch);
  });
}
