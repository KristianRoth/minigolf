use futures_util::{SinkExt, TryFutureExt};
use rand::prelude::*;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use warp::ws::Message;

use crate::event::{Event, ShotEvent, UpdateEvent, InitEvent};

pub type WebSocketSender = futures_util::stream::SplitSink<warp::ws::WebSocket, warp::ws::Message>;

pub struct Vector<T> {
    pub x: T,
    pub y: T,
}

pub struct Game {
    pub game_id: String,
    pub players: HashMap<u32, Player>,
    pub map: GameMap,
}

pub struct GameMap {
    id: u32,
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
            players: HashMap::default(),
            map: GameMap { id: 1 },
        }
    }

    pub fn add_connection(&mut self, ws: WebSocketSender) -> u32 {
        let mut rng = rand::thread_rng();
        let id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
        self.players.insert(
            id,
            Player {
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
            },
        );
        return id;
    }

    
    pub fn tick(&mut self) {
        for (_id, player) in self.players.iter_mut() {
            player.update()
        }
    }
    
    fn get_game_state(&self) -> Event {
        UpdateEvent::from_game(self)
    }

    fn get_init_message(&self) -> Event {
        InitEvent::from_game(self)
    }
    
    pub async fn send_init_message(&mut self, player_id: u32) {
        let init_message = self.get_init_message();
        if let Some(player) = self.players.get_mut(&player_id) {
            player.send_event(&init_message).await
        }
    }

    pub async fn send_update(&mut self) {
        let game_state = self.get_game_state();
        for player in self.players.values_mut() {
            player.send_event(&game_state).await;
        }
    }

    pub fn shot(&mut self, shot_event: ShotEvent, player_id: u32) {
        if player_id != shot_event.id {
            return;
        }
        let player = self.players.get_mut(&shot_event.id).unwrap();
        player.vel.x = shot_event.x / 10.0;
        player.vel.y = shot_event.y / 10.0;
    }
}

impl Player {
    pub fn update(&mut self) {
        let radius = 50.0;
        self.pos.x += self.vel.x;
        self.pos.y += self.vel.y;
        self.vel.x *= 0.99;
        self.vel.y *= 0.99;
        if self.pos.x < radius || self.pos.x > 4900.0 - radius {
            self.vel.x = -self.vel.x
        }
        if self.pos.y < radius || self.pos.y > 2500.0 - radius {
            self.vel.y = -self.vel.y
        }
    }

    pub async fn send_event(&mut self, event: &Event) {
        self
            .ws
            .send(Message::text(serde_json::to_string(&event).unwrap()))
            .unwrap_or_else(|e| {
                eprintln!("websocket send error: {}", e);
            })
            .await;
    }
}
