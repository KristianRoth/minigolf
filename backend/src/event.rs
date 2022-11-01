use crate::{
    game::{Game, Player},
    game_map::{GameMap, GameMapTile},
};
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
#[serde(rename_all = "camelCase")]
pub struct PlayerUpdateDTO {
    id: u32,
    name: String,
    shot_count: u32,
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
            name: player.name.to_string(),
            shot_count: player.shot_count,
            x: player.ball.pos.x,
            y: player.ball.pos.y,
            dx: player.ball.vel.x,
            dy: player.ball.vel.y,
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
#[serde(rename_all = "camelCase")]
pub struct InitEvent {
    player_id: u32,
    players: Vec<PlayerUpdateDTO>,
    game_map: GameMapDTO,
}

impl InitEvent {
    pub fn from_game(game: &Game, player_id: u32) -> Event {
        Event::INIT(InitEvent {
            player_id,
            players: PlayerUpdateDTO::from_game(game),
            game_map: GameMapDTO::from_game(game),
        })
    }
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct GameMapDTO {
    id: String,
    tiles: Vec<GameMapTile>,
}

impl GameMapDTO {
    pub fn from_game(game: &Game) -> Self {
        Self {
            id: game.map.id.to_string(),
            tiles: game.map.tiles.clone().into_iter().flatten().collect(),
        }
    }
    pub fn to_game_map(&self) -> GameMap {
        let mut tiles: Vec<Vec<Option<GameMapTile>>> = vec![vec![None; 25]; 49];

        println!("Tiles length {}", tiles.len());

        self.tiles.iter().for_each(|tile| {
            let x = tile.pos.x as usize / 100;
            let y = tile.pos.y as usize / 100;
            tiles[x][y] = Some(tile.clone());
        });

        GameMap {
            id: self.id.to_string(),
            tiles: tiles
                .iter()
                .map(|row| row.iter().map(|t| t.clone().unwrap()).collect())
                .collect(),
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TurnBeginEvent {
    player_id: u32,
}

impl TurnBeginEvent {
    pub fn new(player_id: u32) -> Event {
        Event::TURNBEGIN(TurnBeginEvent { player_id })
    }
}
