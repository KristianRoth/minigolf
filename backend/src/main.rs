use crate::game::Game;
use event::GameMapDTO;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::Arc;
use tokio::sync::RwLock;
use warp::Filter;

mod communications;
mod event;
mod game;
mod game_map;
mod math;

pub type Games = Arc<RwLock<HashMap<String, Game>>>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Payload {
    game_id: String,
}

#[tokio::main]
async fn main() {
    println!("Server is running");

    pretty_env_logger::init();
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
        .and(games_filter.clone())
        .and(warp::query::<communications::ConnectionParams>())
        .map(
            |game_id: String, ws: warp::ws::Ws, games, params: communications::ConnectionParams| {
                ws.on_upgrade(move |socket| communications::connect(socket, games, game_id, params))
            },
        );

    let index = warp::fs::file("../frontend/build/index.html");

    let files = warp::fs::dir("../frontend/build/");

    let get_routes = warp::get().and(api.or(websocket).or(files).or(index));

    // TODO: Add a whitelist
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["OPTIONS", "PUT", "POST", "DELETE"]);

    let create_game = warp::path!("game")
        .and(warp::post())
        .and(warp::body::json())
        .and(games_filter)
        .and_then(create_new_game)
        .with(cors);

    let routes = get_routes.or(create_game);

    warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
}

pub async fn create_new_game(
    g_dto: GameMapDTO,
    games: Games,
) -> Result<impl warp::Reply, Infallible> {
    let game_id = communications::create_game(games, g_dto).await;
    Ok(warp::reply::json(&Payload { game_id }))
}
