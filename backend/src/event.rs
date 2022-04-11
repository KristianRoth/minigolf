use warp::ws::Message;
use serde::Deserialize;
use crate::game::{Game, Player, GameMap};

#[derive(serde::Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum Event {
    UPDATE(UpdateEvent),
    SHOT(ShotEvent),
    INIT(InitEvent),
}

pub fn parse_event(message: Message) -> Result<Event, String> {
    if message.is_text() {
        let json = message.to_str().unwrap();
        return match serde_json::from_str::<Event>(json) {
            Ok(event) => Ok(event),
            _ => Err(format!("Failed to parse json {:?}", json)),
        }
    }
    return Err("Failed nessage is not of type text".to_string())
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
                .map(|player| Self::from_player(player))
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

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct InitEvent {
    players: Vec<PlayerUpdateDTO>,
    game_map: GameMapDTO,
}

impl InitEvent {
    pub fn from_game(game: &Game) -> Event {
        Event::INIT(InitEvent {
            players: PlayerUpdateDTO::from_game(game),
            game_map: GameMapDTO::from_game(game),
        })
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct GameMapDTO {

}

impl GameMapDTO {
    pub fn from_game(game: &Game) -> Self {
        Self {

        }
    }
}