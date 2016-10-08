import Server from 'socket.io';
// import { Map } from 'immutable'

export default function startServer(store) {
  const io = new Server().attach(8090);

  const getState = () => store.getState().toJS()

  const playerSockets = new Map()

  store.subscribe(() => {
    console.log('Hooray! Redux state updated! Broadcasting to all clients.');
    // TODO: figure out how to associate a websocket to a player

    console.log(getState())
    io.emit('state', getState())

    console.log('also whispering:')

    playerSockets.forEach((socket, player) => {
      console.log(`  player ${player} ${socket}`)
      socket.emit('hello', `~hello ${player}~`)
    })

  });

  io.on('connection', (client) => {
    const dispatch = (action) => {
      console.log(`action received from websocket ${client.id}: ${JSON.stringify(action)}`);

      // XXX do some sort of validation - no?
      store.dispatch(action);
    };

    client.on('action', (action) => {
      // can't store sockets in the redux store (not serializable).
      // Map player names to sockets.
      if (action.type == 'ADD_PLAYER') {
        console.log(`Socket ${client.id} is now player ${action.player}`)
        playerSockets.set(action.player, client)
      }
      dispatch(action)
    });

    console.log('Accepted connection, providing current state to new client');
    console.log(getState())
    client.emit('state', getState());
    console.log('------------------------------------------------------------')
  });
}
