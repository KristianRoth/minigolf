use warp::Filter;

use std::collections::HashMap;
use std::sync::{
  atomic::{AtomicUsize, Ordering},
  Arc,
};

use futures_util::{SinkExt, StreamExt, TryFutureExt};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{Message, WebSocket};

use serde::{Deserialize, Serialize};

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);

/// Our state of currently connected users.
///
/// - Key is their id
/// - Value is a sender of `warp::ws::Message`
type Users = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

#[derive(Serialize, Deserialize)]
struct Payload {
  user: String,
  value: String,
}

#[tokio::main]
async fn main() {
  println!("Server is running");

  pretty_env_logger::init();

  // Keep track of all connected users, key is usize, value
  // is a websocket sender.
  let users = Users::default();
  // Turn our "state" into a new Filter...
  let users = warp::any().map(move || users.clone());

  // GET /chat -> websocket upgrade
  let chat = warp::path("chat")
    // The `ws()` filter will prepare Websocket handshake...
    .and(warp::ws())
    .and(users)
    .map(|ws: warp::ws::Ws, users| {
      // This will call our function if the handshake succeeds.
      ws.on_upgrade(move |socket| user_connected(socket, users))
    });


  let index = warp::fs::file("../frontend/build/index.html");

  let files = warp::fs::dir("../frontend/build/");

  let routes = warp::get().and(api.or(chat).or(files).or(index));

  warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
}

async fn user_connected(ws: WebSocket, users: Users) {
  // Use a counter to assign a new unique ID for this user.
  let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

  eprintln!("new chat user: {}", my_id);

  // Split the socket into a sender and receive of messages.
  let (mut user_ws_tx, mut user_ws_rx) = ws.split();

  // Use an unbounded channel to handle buffering and flushing of messages
  // to the websocket...
  let (tx, rx) = mpsc::unbounded_channel();
  let mut rx = UnboundedReceiverStream::new(rx);

  tokio::task::spawn(async move {
    while let Some(message) = rx.next().await {
      user_ws_tx
        .send(message)
        .unwrap_or_else(|e| {
          eprintln!("websocket send error: {}", e);
        })
        .await;
    }
  });

  // tokio::task::spawn(async move {
  //     let interval = tokio::time::interval(std::time::Duration::from_millis(100));
  //     loop {
  //         interval.tick().await;
  //             user_ws_tx
  //             .send("INTERVAL")
  //             .unwrap_or_else(|e| {
  //                 eprintln!("websocket send error: {}", e);
  //             })
  //             .await;

  //     }
  // });

  // Save the sender in our list of connected users.
  users.write().await.insert(my_id, tx);

  // Return a `Future` that is basically a state machine managing
  // this specific user's connection.

  // Every time the user sends a message, broadcast it to
  // all other users...
  while let Some(result) = user_ws_rx.next().await {
    let msg = match result {
      Ok(msg) => msg,
      Err(e) => {
        eprintln!("websocket error(uid={}): {}", my_id, e);
        break;
      }
    };
    user_message(my_id, msg, &users).await;
  }

  // user_ws_rx stream will keep processing as long as the user stays
  // connected. Once they disconnect, then...
  user_disconnected(my_id, &users).await;
}

async fn user_message(my_id: usize, msg: Message, users: &Users) {
  // Skip any non-Text messages...
  let msg = if let Ok(s) = msg.to_str() {
    s
  } else {
    return;
  };

  let payload = Payload {
    user: my_id.to_string(),
    value: msg.to_string(),
  };

  let json = serde_json::to_string(&payload).unwrap();

  // New message from this user, send it to everyone else (except same uid)...
  for (&uid, tx) in users.read().await.iter() {
    if my_id != uid {
      if let Err(_disconnected) = tx.send(Message::text(json.clone())) {
        // The tx is disconnected, our `user_disconnected` code
        // should be happening in another task, nothing more to
        // do here.
      }
    }
  }
}

async fn user_disconnected(my_id: usize, users: &Users) {
  eprintln!("good bye user: {}", my_id);

  // Stream closed up, so remove from the user list
  users.write().await.remove(&my_id);
}
