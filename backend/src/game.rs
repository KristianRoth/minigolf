use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use rand::prelude::*;
use futures_util::{SinkExt, TryFutureExt};

pub type WebSocketSender = futures_util::stream::SplitSink<warp::ws::WebSocket, warp::ws::Message>;

pub struct Vector<T> {
  x: T,
  y: T,
}

pub struct Game {
  game_id: String,
  players: HashMap<u32, Player>
}

pub struct Player {
  id: u32,
  pos: Vector<f64>,
  vel: Vector<f64>,
  ws: WebSocketSender,
}

static NEXT_USER_ID: AtomicU32 = AtomicU32::new(1);

impl Game {
  pub fn new(game_id: String) -> Self {
    Self {
      game_id: game_id,
      players: HashMap::default()
    }
  }

  pub fn add_connection(&mut self, ws: WebSocketSender) {
    let mut rng = rand::thread_rng();
    let id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    self.players.insert(id, Player {
      id: id,
      pos: Vector {
        x: rng.gen::<f64>() * 49000.0,
        y: rng.gen::<f64>() * 25000.0,
      },
      vel: Vector {
        x: (rng.gen::<f64>() - 0.5) * 100.0,
        y: (rng.gen::<f64>() - 0.5) * 100.0,
      },
      ws: ws,
    });
  }

  pub fn tick(&mut self) {
    for (_id, player) in self.players.iter_mut() {
      player.update()
    }
  }

  fn get_game_state(&self) -> UpdateEvent {
    let mut player_states = std::vec::Vec::new();
    for (_id, player) in self.players.iter() {
      player_states.push(PlayerDTO {
        id: player.id,
        x: player.pos.x,
        y: player.pos.y,
        dx: player.vel.x,
        dy: player.vel.y,
      })
    }
    UpdateEvent {
      r#type: "UPDATE".to_string(),
      playerStates: player_states,
    }
  }

  pub async fn send_update(&mut self) {
    let game_state = serde_json::to_string(&self.get_game_state()).unwrap();
    for (_id, player) in self.players.iter_mut() {
      player.ws
        .send(warp::ws::Message::text(game_state.clone()))
        .unwrap_or_else(|e| {
          eprintln!("websocket send error: {}", e);
        }).await;
    }
  }
}

impl Player {

  pub fn update(&mut self) {
    self.pos.x += self.vel.x;
    self.pos.y += self.vel.y;
  }
}

#[derive(serde::Serialize)]
struct UpdateEvent {
    r#type: String,
    playerStates: std::vec::Vec<PlayerDTO>, 
}

#[derive(serde::Serialize)]
struct PlayerDTO {
    id: u32,
    x: f64,
    y: f64,
    dx: f64,
    dy: f64,
}