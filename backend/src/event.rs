use crate::{game::{Game, Player}, game_map::{GameMap, GameMapTile}};
use serde::Deserialize;
use warp::ws::Message;

#[derive(serde::Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Event {
    UPDATE(UpdateEvent),
    SHOT(ShotEvent),
    INIT(InitEvent),
    #[serde(rename(serialize = "TURN_BEGIN"))]
    TURNBEGIN(TurnBeginEvent),
}

pub fn parse_event(message: Message) -> Result<Event, String> {
    if message.is_text() {
        let json = message.to_str().unwrap();
        return match serde_json::from_str::<Event>(json) {
            Ok(event) => Ok(event),
            _ => Err(format!("Failed to parse json {:?}", json)),
        };
    }
    return Err("Failed nessage is not of type text".to_string());
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct UpdateEvent {
    #[serde(rename(serialize = "playerStates"))]
    player_states: Vec<PlayerUpdateDTO>,
}

impl UpdateEvent {
    pub fn from_game(game: &Game) -> Event {
        Event::UPDATE(UpdateEvent {
            player_states: Vec::from_iter(
                game.players
                    .values()
                    .map(|player| PlayerUpdateDTO::from_player(player)),
            ),
        })
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct PlayerUpdateDTO {
    id: u32,
    x: f64,
    y: f64,
    dx: f64,
    dy: f64,
}

impl PlayerUpdateDTO {
    pub fn from_game(game: &Game) -> Vec<Self> {
        Vec::from_iter(
            game.players
                .values()
                .map(|player| Self::from_player(player)),
        )
    }

    pub fn from_player(player: &Player) -> Self {
        Self {
            id: player.id,
            x: player.pos.x,
            y: player.pos.y,
            dx: player.vel.x,
            dy: player.vel.y,
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct ShotEvent {
    pub id: u32,
    pub x: f64,
    pub y: f64,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct InitEvent {
    #[serde(rename(serialize = "playerId"))]
    player_id: u32,
    #[serde(rename(serialize = "players"))]
    players: Vec<PlayerUpdateDTO>,
    #[serde(rename(serialize = "gameMap"))]
    game_map: GameMapDTO,
}

impl InitEvent {
    pub fn from_game(game: &Game, player_id: u32) -> Event {
        Event::INIT(InitEvent {
            player_id: player_id,
            players: PlayerUpdateDTO::from_game(game),
            game_map: GameMapDTO::from_game(game),
        })
    }
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct GameMapDTO {
    tiles: Vec<GameMapTile>,
}

impl GameMapDTO {
    pub fn from_game(game: &Game) -> Self {
        Self {
            tiles: game.map.tiles.clone().into_iter().flatten().collect()
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct TurnBeginEvent {
    #[serde(rename(serialize = "playerId"))]
    player_id: u32,
}

impl TurnBeginEvent {
    pub fn new(player_id: u32) -> Event {
        Event::TURNBEGIN( TurnBeginEvent {
            player_id: player_id,
        })
    }
}
