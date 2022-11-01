use futures_util::{SinkExt, TryFutureExt};
use rand::{distributions::Alphanumeric, Rng};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use warp::ws::Message;
use std::time::{SystemTime};

use crate::event::{Event, GameMapDTO, InitEvent, ShotEvent, TurnBeginEvent, UpdateEvent};
use crate::game_map::{GameMap, SpecialEffect};
use crate::math::VectorF64;

pub type WebSocketSender = futures_util::stream::SplitSink<warp::ws::WebSocket, warp::ws::Message>;

pub struct Game {
    last_event_time: SystemTime,
    pub game_id: String,
    pub players: HashMap<u32, Player>,
    pub map: GameMap,
}

#[derive(Debug, Clone, Copy)]
pub struct Ball {
    pub pos: VectorF64,
    pub vel: VectorF64,
}

pub struct Player {
    pub id: u32,
    pub name: String,
    pub ball: Ball,
    pub ws: Option<WebSocketSender>,
    pub is_turn: bool,
    pub shot_count: u32,
}

static NEXT_USER_ID: AtomicU32 = AtomicU32::new(1);

const IDLE_AFTER_SECONDS: u32 = 1800;

impl Game {
    pub fn new(game_id: String) -> Self {
        Self {
            last_event_time: SystemTime::now(),
            game_id,
            players: HashMap::default(),
            map: GameMap::new(),
        }
    }

    pub fn new_from_dto(map: GameMapDTO) -> Self {
        Self {
            last_event_time: SystemTime::now(),
            game_id: rand::thread_rng()
                .sample_iter(&Alphanumeric)
                .take(5)
                .map(char::from)
                .collect(),
            players: HashMap::default(),
            map: map.to_game_map(),
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
                player.ws = Some(ws);
                return player.id;
            }
        }
        let id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
        self.players.insert(
            id,
            Player {
                id,
                name,
                ball: Ball {
                    pos: self.map.get_start_location(),
                    vel: VectorF64 { x: 0.0, y: 0.0 },
                },
                ws: Some(ws),
                is_turn: false,
                shot_count: 0,
            },
        );
        return id;
    }

    pub fn remove_connection(&mut self, player_id: u32) {
        if let Some(player) = self.players.get_mut(&player_id) {
            println!("Disconnecting player {}", player_id);
            player.ws = None;
        }
    }

    pub async fn tick(&mut self) {
        for (_id, player) in self.players.iter_mut() {
            player.update().await;
            match self.map.collide(&mut player.ball) {
                Some(SpecialEffect::Hole) => player.hole(self.map.get_start_location()),
                _ => continue,
            }
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
        self.last_event_time = SystemTime::now();
        self.players.get_mut(&player_id).unwrap().shot(shot_event);
    }

    pub fn is_idle(&self) -> bool {
        let time_since_last_action = SystemTime::now().duration_since(self.last_event_time).unwrap();
        return time_since_last_action.as_secs() as u32 > IDLE_AFTER_SECONDS;
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
        if let Some(socket) = &mut self.ws {
            socket
                .send(Message::text(serde_json::to_string(&event).unwrap()))
                .unwrap_or_else(|e| {
                    eprintln!("websocket send error: {}", e);
                })
                .await
        }
    }

    pub fn shot(&mut self, shot_event: ShotEvent) {
        if shot_event.id != self.id || !self.is_turn {
            return;
        }
        self.ball.vel.x = shot_event.x / 10.0;
        self.ball.vel.y = shot_event.y / 10.0;
        self.is_turn = false;
        self.shot_count += 1;
    }

    pub fn hole(&mut self, start_pos: VectorF64) {
        self.ball.pos = start_pos;
        self.ball.vel = VectorF64::new(0.0, 0.0);
        self.shot_count = 0;
    }
}
