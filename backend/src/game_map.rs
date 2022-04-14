use std::cmp::Ordering;

use serde::{Deserialize, Serialize};

use crate::{
    game::Ball,
    math::{Line, VectorF64},
};

pub type GameTiles = Vec<Vec<GameMapTile>>;

type Point = VectorF64;
pub struct GameMap {
    id: u32,
    pub tiles: Vec<Vec<GameMapTile>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GameMapTile {
    pos: VectorF64,
    #[serde(rename(serialize = "groundType"))]
    ground_type: GroundType,
    #[serde(rename(serialize = "structureType"))]
    structure_type: StructureType,
}

#[derive(Clone, Serialize, Deserialize)]
pub enum GroundType {
    Grass,
    Water,
    ShallowWater,
    LightDirt,
    HeavyDirt,
}

#[derive(Clone, Serialize, Deserialize)]
pub enum StructureType {
    Wall,
    Circle,
    None,
}

pub enum Collider {
    Point((f64, f64)),
    Circle((f64, f64), f64),
    Line((f64, f64), (f64, f64)),
}

const BOX_COLLIDERS: [Collider; 8] = [
    Collider::Line((0.0, 0.0), (100.0, 0.0)),
    Collider::Line((100.0, 0.0), (0.0, 100.0)),
    Collider::Line((100.0, 100.0), (-100.0, 0.0)),
    Collider::Line((0.0, 100.0), (0.0, -100.0)),
    Collider::Point((0.0, 0.0)),
    Collider::Point((100.0, 0.0)),
    Collider::Point((100.0, 100.0)),
    Collider::Point((0.0, 100.0)),
];

const CIRCLE_COLLIDERS: [Collider; 1] = [
    Collider::Circle((50.0, 50.0), 24.0),
];

impl Collider {
    pub fn get_project_point(&self, position: &VectorF64, ball: &Point) -> Option<Point> {
        match self {
            Collider::Point((x, y)) => return Some(position.add(&Point::new(*x, *y))),
            Collider::Line(pos, dir) => {
                return Line::new(
                    &position.add(&Point::from_tuple(*pos)),
                    &Point::from_tuple(*dir),
                )
                .project_point(ball)
            }
            Collider::Circle(pos, radius) => {
                let circle_centre = position.add(&Point::from_tuple(*pos));
                return Some(circle_centre.add(&ball.sub(&circle_centre).get_unit().multi(*radius)))
            }
        }
    }
}

impl StructureType {
    fn get_collision_points(&self, pos: VectorF64, ball: &mut Ball) -> Vec<Point> {
        match self {
            StructureType::Wall => self.box_collide(pos, ball),
            StructureType::Circle => self.circle_collide(pos, ball),
            StructureType::None => Vec::<Point>::default(),
        }
    }
    fn box_collide(&self, pos: VectorF64, ball: &mut Ball) -> Vec<Point> {
        let colliders = BOX_COLLIDERS;

        let projection_points: Vec<Point> = colliders
            .iter()
            .map(|collider| collider.get_project_point(&pos, &ball.pos))
            .filter(|point| point.is_some())
            .map(|point| point.unwrap())
            .collect();

        projection_points
        //let closest = projection_points.iter()
        //    .min_by(|a, b| a.dist(&ball.pos).partial_cmp(&b.dist(&ball.pos)).unwrap_or(Ordering::Equal)).unwrap();
    }

    fn circle_collide(&self, pos: VectorF64, ball: &mut Ball) -> Vec<Point> {
        let colliders = CIRCLE_COLLIDERS;
        let projection_points: Vec<Point> = colliders
            .iter()
            .map(|collider| collider.get_project_point(&pos, &ball.pos))
            .filter(|point| point.is_some())
            .map(|point| point.unwrap())
            .collect();

        projection_points
    }
}

impl GameMap {
    pub fn new() -> Self {
        Self {
            id: 1,
            tiles: Self::create_map(),
        }
    }

    pub fn create_map() -> GameTiles {
        let mut tiles: GameTiles = GameTiles::default();
        for x in 0..49i32 {
            let mut tiles_column: Vec<GameMapTile> = Vec::default();
            for y in 0..25i32 {
                let is_border = x == 0 || y == 0 || x == 49 - 1 || y == 25 - 1;
                let is_middle_map = y % 2 == 0 && x % 2 == 0;
                if is_border {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::Grass,
                        structure_type: StructureType::Wall,
                    })
                } else if is_middle_map {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::Grass,
                        structure_type: StructureType::Circle,
                    })
                } else {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::Grass,
                        structure_type: StructureType::None,
                    })
                }
            }
            tiles.push(tiles_column)
        }
        return tiles;
    }

    pub fn collide(&self, ball: &mut Ball) {
        let mut d_pos = ball.vel.length();
        if d_pos < 1.0 {
            return;
        }
        loop {
            let x_start = (((ball.pos.x - 100.0) / 100.0) as usize).max(0);
            let y_start = (((ball.pos.y - 100.0) / 100.0) as usize).max(0);

            let close_tiles = self
                .tiles
                .iter()
                .skip(x_start)
                .take(5)
                .map(|s| s.iter().skip(y_start).take(5))
                .flatten()
                .collect::<Vec<_>>();
            let points = close_tiles
                .iter()
                .map(|tile| tile.structure_type.get_collision_points(tile.pos, ball))
                .flatten()
                .collect::<Vec<_>>();
            let closest = points.iter().min_by(|a, b| {
                a.dist(&ball.pos)
                    .partial_cmp(&b.dist(&ball.pos))
                    .unwrap_or(Ordering::Equal)
            });
            if let Some(closest) = closest {
                let distance_to_wall = closest.dist(&ball.pos);
                //let mut answer = String::new();
                //io::stdin().read_line(&mut answer)
                //.ok()
                //.expect("Failed to read line");
                if distance_to_wall < 50.0 {
                    println!("Seinä {:?}", closest);
                    println!("Pallo {:?}", ball.pos);
                    self.do_collision(closest, ball)
                }
                let to_move = d_pos.min(distance_to_wall - 49.9).max(1.0);
                ball.pos = ball.pos.add(&ball.vel.get_unit().multi(to_move));
                println!("adding some: {}/{}", to_move, ball.vel.length());

                d_pos -= to_move;
            } else {
                ball.pos = ball.pos.add(&ball.vel.get_unit().multi(d_pos));
                return;
            }
            if d_pos < 0.0001 {
                return;
            };
        }
    }

    pub fn do_collision(&self, projection_point: &Point, ball: &mut Ball) {
        let basis = &ball.pos.sub(&projection_point).get_unit();
        let mut basis_chaged = ball.vel.change_base(basis);
        basis_chaged.x = -basis_chaged.x;
        ball.vel = basis_chaged.change_to_normal_base(basis);
        ball.pos = projection_point.add(&basis.multi(50.1));
    }
}

#[cfg(test)]
mod tests {
    use crate::{game::Ball, math::VectorF64};

    use super::{GameMap, Point};

    // add
    #[test]
    fn test_add() {
        let projection_point = Point::new(100.0, 100.0);
        let mut ball = Ball {
            pos: VectorF64::new(0.0, 0.0),
            vel: VectorF64::new(1.0, 1.0),
        };
        let game_map = GameMap::new();
        game_map.do_collision(&projection_point, &mut ball);
        println!("{:?}", ball);
    }
}
