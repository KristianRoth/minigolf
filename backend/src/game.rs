use futures_util::{SinkExt, TryFutureExt};
use rand::prelude::*;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use warp::ws::Message;

use crate::event::{Event, InitEvent, ShotEvent, TurnBeginEvent, UpdateEvent};
use crate::game_map::GameMap;
use crate::math::VectorF64;

pub type WebSocketSender = futures_util::stream::SplitSink<warp::ws::WebSocket, warp::ws::Message>;

pub struct Game {
    pub game_id: String,
    pub players: HashMap<u32, Player>,
    pub map: GameMap,
}

#[derive(Debug)]
pub struct Ball {
    pub pos: VectorF64,
    pub vel: VectorF64,
}

pub struct Player {
    pub id: u32,
    pub name: String,
    pub ball: Ball,
    pub ws: WebSocketSender,
    pub is_turn: bool,
}

static NEXT_USER_ID: AtomicU32 = AtomicU32::new(1);

impl Game {
    pub fn new(game_id: String) -> Self {
        Self {
            game_id: game_id,
            players: HashMap::default(),
            map: GameMap::new(),
        }
    }

    pub fn add_connection(
        &mut self,
        ws: WebSocketSender,
        name: String,
        reconnect_id: Option<u32>,
    ) -> u32 {
        if let Some(possible_id) = reconnect_id {
            if let Some(player) = self.players.get_mut(&possible_id) {
                println!("Reconnecting player {}, {}", possible_id, player.name);
                player.ws = ws;
                return player.id;
            }
        }
        let mut rng = rand::thread_rng();
        let id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
        self.players.insert(
            id,
            Player {
                id,
                name,
                ball: Ball {
                    pos: VectorF64 {
                        x: rng.gen::<f64>() * 4900.0,
                        y: rng.gen::<f64>() * 2500.0,
                    },
                    vel: VectorF64 {
                        x: (rng.gen::<f64>() - 0.5) * 10.0,
                        y: (rng.gen::<f64>() - 0.5) * 10.0,
                    },
                },
                ws: ws,
                is_turn: false,
            },
        );
        return id;
    }

    pub async fn tick(&mut self) {
        for (_id, player) in self.players.iter_mut() {
            player.update().await;
            self.map.collide(&mut player.ball)
        }
    }
    fn get_game_state(&self) -> Event {
        UpdateEvent::from_game(self)
    }
    pub async fn send_init_message(&mut self, player_id: u32) {
        let init_message = InitEvent::from_game(self, player_id);
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
        self.players.get_mut(&player_id).unwrap().shot(shot_event);
    }
}

impl Player {
    pub async fn update(&mut self) {
        self.ball.vel = self.ball.vel.multi(0.97);
        if !self.is_turn && self.ball.vel.length() <= 1.0 {
            self.ball.vel = VectorF64::new(0.0, 0.0);
            self.is_turn = true;
            self.send_event(&TurnBeginEvent::new(self.id)).await;
        }
    }

    pub async fn send_event(&mut self, event: &Event) {
        self.ws
            .send(Message::text(serde_json::to_string(&event).unwrap()))
            .unwrap_or_else(|e| {
                eprintln!("websocket send error: {}", e);
            })
            .await;
    }

    pub fn shot(&mut self, shot_event: ShotEvent) {
        if shot_event.id != self.id || !self.is_turn {
            return;
        }
        self.ball.vel.x = shot_event.x / 10.0;
        self.ball.vel.y = shot_event.y / 10.0;
        self.is_turn = false;
    }
}
