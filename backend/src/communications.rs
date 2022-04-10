use futures_util::{StreamExt};
use crate::Games;
use crate::game::Game;

pub async fn connect(ws: warp::ws::WebSocket, games: Games, game_id: String) {
    let (tx, mut rx) = ws.split();
    let mut game = match games.write().await.remove(&game_id) {
        Some(found) => found,
        None => Game::new(game_id.clone())
    };
    game.add_connection(tx);
    games.write().await.insert(game_id.clone(), game);
    while let Some(result) = rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(_) => {
                eprintln!("Error in receiving data");
                break;
            }
        };
        process_user_event(msg, games.clone(), &game_id).await;
    }
    
}

async fn process_user_event(event: warp::ws::Message, games: Games, game_id: &String) {
    println!("message received");
    println!("Gameid {}", game_id);
    for (game_id, _game) in games.read().await.iter() {
        println!("{}", game_id);
    }
}

pub async fn start_loop(games: Games) {
    const TICK_RATE: u64 = 1000/60;
    
    println!("Starting game loop");
    tokio::task::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_millis(TICK_RATE));
        loop {
            interval.tick().await;
            println!("GameTick *** START ***");
            for (game_id, game) in games.write().await.iter_mut() {
                println!("{}", game_id);
                game.tick();
                game.send_update().await;
            }
            println!("GameTick *** END  ***")
        }
    });
}



