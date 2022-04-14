use crate::game::Game;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use warp::Filter;
mod communications;
mod event;
mod game;
mod game_map;
mod math;

pub type Games = Arc<RwLock<HashMap<String, Game>>>;

#[tokio::main]
async fn main() {
    println!("Server is running");
    // GET /hi
    let hi = warp::path("hi").map(|| "Hello, World!");
    // GET /hello/from/warp
    let hello_from_warp = warp::path!("hello" / "from" / "warp").map(|| "Hello from warp!");
    // GET /sum/:u32/:u32
    let sum = warp::path!("sum" / u32 / u32).map(|a, b| format!("{} + {} = {}", a, b, a + b));

    // Mount routes on "api" - path.
    let api = warp::path!("api").and(hi.or(hello_from_warp).or(sum));

    let games = Games::default();
    communications::start_loop(games.clone()).await;
    let games_filter = warp::any().map(move || games.clone());
    let websocket = warp::path!("game" / String)
        .and(warp::ws())
        .and(games_filter)
        .and(warp::query::<communications::ConnectionParams>())
        .map(
            |game_id: String, ws: warp::ws::Ws, games, params: communications::ConnectionParams| {
                println!("URL params {:?}", params);
                ws.on_upgrade(move |socket| communications::connect(socket, games, game_id, params))
            },
        );

    let index = warp::fs::file("../frontend/build/index.html");

    let files = warp::fs::dir("../frontend/build/");

    let routes = warp::get().and(api.or(websocket).or(files).or(index));
    warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
}
