use crate::game::{Game, Player};

#[derive(serde::Serialize)]
pub struct UpdateEvent {
    r#type: String,
    #[serde(rename(serialize = "playerStates"))]
    player_states: Vec<PlayerDTO>,
}

impl UpdateEvent {
    pub fn from_game(game: &Game) -> Self {
        Self {
            r#type: "UPDATE".to_string(),
            player_states: Vec::from_iter(
                game.players
                    .values()
                    .map(|player| PlayerDTO::from_player(player)),
            ),
        }
    }
}

#[derive(serde::Serialize)]
pub struct PlayerDTO {
    id: u32,
    x: f64,
    y: f64,
    dx: f64,
    dy: f64,
}

impl PlayerDTO {
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

#[derive(serde::Deserialize, Debug)]
pub struct ShotEvent {
    r#type: String,
    pub id: u32,
    pub x: f64,
    pub y: f64,
}