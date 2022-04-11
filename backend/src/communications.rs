use crate::game::Game;
use crate::Games;
use crate::event::{parse_event, Event};
use futures_util::StreamExt;

pub async fn connect(ws: warp::ws::WebSocket, games: Games, game_id: String) {
    let (tx, mut rx) = ws.split();
    let mut game = match games.write().await.remove(&game_id) {
        Some(found) => found,
        None => Game::new(game_id.clone()),
    };
    let player_id = game.add_connection(tx);
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
}

async fn process_user_event(event: warp::ws::Message, games: Games, game_id: &String, player_id: u32) {
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
        e => eprintln!("for game '{game_id}', unexpected event: {:?}", e),
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
                game.tick();
                game.send_update().await;
            }
        }
    });
}

