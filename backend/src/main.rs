use poem::{get, handler, listener::TcpListener, web::Path, Route, Server};
use poem::endpoint::StaticFilesEndpoint;

#[handler]
fn hello(Path(name): Path<String>) -> String {
    format!("hello: {}\n", name)
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), std::io::Error> {
    println!("Server has started");
    let app = Route::new()
        .at("/hello/:name", get(hello))
        .at("*", StaticFilesEndpoint::new("../frontend/build").index_file("index.html"));
    Server::new(TcpListener::bind("0.0.0.0:3000"))
        .run(app)
        .await
}