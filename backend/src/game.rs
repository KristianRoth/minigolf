use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use rand::prelude::*;
use futures_util::{SinkExt, TryFutureExt};

use crate::event::{UpdateEvent};

pub type WebSocketSender = futures_util::stream::SplitSink<warp::ws::WebSocket, warp::ws::Message>;

pub struct Vector<T> {
  pub x: T,
  pub y: T,
}

pub struct Game {
  pub game_id: String,
  pub players: HashMap<u32, Player>
}

pub struct Player {
  pub id: u32,
  pub pos: Vector<f64>,
  pub vel: Vector<f64>,
  pub ws: WebSocketSender,
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
        x: rng.gen::<f64>() * 4900.0,
        y: rng.gen::<f64>() * 2500.0,
      },
      vel: Vector {
        x: (rng.gen::<f64>() - 0.5) * 10.0,
        y: (rng.gen::<f64>() - 0.5) * 10.0,
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
    UpdateEvent::from_game(self)
  }

  pub async fn send_update(&mut self) {
    let game_state = serde_json::to_string(&self.get_game_state()).unwrap();
    for player in self.players.values_mut() {
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
    if self.pos.x < 100.0 || self.pos.x > 4900.0 - 100.0 {
      self.vel.x = -self.vel.x
    }
    if self.pos.y < 100.0 || self.pos.y > 2500.0 - 100.0 {
      self.vel.y = -self.vel.y
    } 
  }
}