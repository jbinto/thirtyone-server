import Server from 'socket.io';

export default function startServer(store) {
  const io = new Server().attach(8090);

  const getState = () => store.getState().toJS()

  store.subscribe(() => {
    console.log('Hooray! Redux state updated! Broadcasting to all clients.');
    console.log(getState())
    io.emit('state', getState())
    console.log('------------------------------------------------------------')
  });

  io.on('connection', (socket) => {
    const dispatch = (action) => {
      console.log(`action received from websocket: ${JSON.stringify(action)}`);

      // XXX do some sort of validation - no?
      store.dispatch(action);
    };

    socket.on('action', dispatch);

    console.log('Accepted connection, providing current state to new client');
    console.log(getState())
    socket.emit('state', getState());
    console.log('------------------------------------------------------------')
  });
}
