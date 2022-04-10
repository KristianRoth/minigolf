use std::collections::HashMap;
use serde::Serialize;

#[derive(Serialize)]
pub struct Game {
  game_id: String,
  message: String,
  players: HashMap<u32, Player>
}

#[derive(Serialize)]
pub struct Player {
  id: u32,
  #[serde(skip_serializing)]
  ws: warp::ws::WebSocket,
}
unsafe impl Sync for Game {}
impl Game {
  pub fn new(game_id: String) -> Self {
    Self {
      game_id: game_id,
      message: "Message".to_string(), 
      players: HashMap::default()
    }
  }

  pub fn add_connection(&mut self, ws: warp::ws::WebSocket) {
    self.players.insert(1, Player {
      id: 1,
      ws: ws,
    });
  }

  pub fn tick(&mut self) {
    println!("Updating game id: {}", self.game_id)
  } 
}

pub fn hello_from_game() {

}
