use crate::event::{parse_event, Event, GameMapDTO};
use crate::game::Game;
use crate::Games;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct ConnectionParams {
    pub id: Option<u32>,
    pub name: String,
}

pub async fn create_game(games: Games, game_map_dto: GameMapDTO) -> String {
    let game = Game::new_from_dto(game_map_dto);
    let game_id = game.game_id.clone();
    games.write().await.insert(game_id.clone(), game);
    game_id
}

pub async fn connect(
    ws: warp::ws::WebSocket,
    games: Games,
    game_id: String,
    params: ConnectionParams,
) {
    let (tx, mut rx) = ws.split();
    let mut game = match games.write().await.remove(&game_id) {
        Some(found) => found,
        None => Game::new(game_id.clone()),
    };
    let player_id = game.add_connection(tx, params.name, params.id);
    game.send_init_message(player_id).await;
    games.write().await.insert(game_id.clone(), game);
    while let Some(result) = rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(_) => {
                eprintln!("Error in receiving data");
                break;
            }
        };
        process_user_event(msg, games.clone(), &game_id, player_id).await;
    }
    if let Some(game) = games.write().await.get_mut(&game_id) {
        game.remove_connection(player_id);
    }
}

async fn process_user_event(
    event: warp::ws::Message,
    games: Games,
    game_id: &String,
    player_id: u32,
) {
    println!("message received");
    println!("Gameid {}", game_id);
    let mut hash_map = games.write().await;
    let game = match hash_map.get_mut(game_id) {
        Some(game) => game,
        _ => {
            eprintln!("No game found with id {}", game_id);
            return;
        }
    };

    match parse_event(event) {
        Ok(Event::SHOT(shot_event)) => game.shot(shot_event, player_id),
        e => return, //eprintln!("for game '{game_id}', unexpected event: {:?}", e),
    };
}

pub async fn start_loop(games: Games) {
    const TICK_RATE: u64 = 1000 / 60;
    println!("Starting game loop");
    tokio::task::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_millis(TICK_RATE));
        loop {
            interval.tick().await;
            for (_game_id, game) in games.write().await.iter_mut() {
                game.tick().await;
                game.send_update().await;
            }
        }
    });
}
