use warp::Filter;

#[tokio::main]
async fn main() {
    println!("Server is running");

    // GET /hi
    let hi = warp::path("hi").map(|| "Hello, World!");

    // GET /hello/from/warp
    let hello_from_warp = warp::path!("hello" / "from" / "warp").map(|| "Hello from warp!");
    // GET /sum/:u32/:u32
    let sum = warp::path!("sum" / u32 / u32).map(|a, b| format!("{} + {} = {}", a, b, a + b));

    let index = warp::fs::file("../frontend/build/index.html");

    let files = warp::fs::dir("../frontend/build/");

    let routes = warp::get().and(hi.or(hello_from_warp).or(sum).or(files).or(index));

    warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
}
