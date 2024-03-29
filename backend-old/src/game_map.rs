use std::{cmp::Ordering, f64::consts::PI};

use serde::{Deserialize, Serialize};

use crate::{
    game::Ball,
    math::{Line, VectorF64, Arc},
};

pub type GameTiles = Vec<Vec<GameMapTile>>;

type Point = VectorF64;

pub struct GameMap {
    pub id: String,
    pub tiles: GameTiles,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameMapTile {
    pub pos: VectorF64,
    #[serde(rename(serialize = "ground", deserialize = "ground"))]
    ground_type: GroundType,
    #[serde(rename(serialize = "structure", deserialize = "structure"))]
    structure_type: StructureType,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum GroundType {
    Grass,
    Water,
    Gravel,
    GravelHeavy,
    Slope(Rotation),
    SlopeDiagonal(Rotation)
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "rotation")]
pub enum Rotation {
    North,
    West,
    East,
    South,
}

impl Rotation {
    pub fn get_angle(&self) -> f64 {
        match self {
            Rotation::North => 0.0,
            Rotation::East => PI/2.0,
            Rotation::South => PI,
            Rotation::West => -PI/2.0,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StructureType {
    Wall,
    Circle,
    Start,
    Hole,
    Wedge(Rotation),
    RoundedCorner(Rotation),
    InvertedRoundedCorner(Rotation),
    None,
}

pub enum SpecialEffect {
    Hole
}

pub enum Collider {
    Point((f64, f64)),
    Circle((f64, f64), f64),
    Line((f64, f64), (f64, f64)),
    Arc((f64, f64), f64, (f64, f64), (f64, f64))
}

const BOX_COLLIDERS: [Collider; 8] = [
    Collider::Point((0.0, 0.0)),
    Collider::Line((0.0, 0.0), (100.0, 0.0)),
    Collider::Point((100.0, 0.0)),
    Collider::Line((100.0, 0.0), (0.0, 100.0)),
    Collider::Point((100.0, 100.0)),
    Collider::Line((100.0, 100.0), (-100.0, 0.0)),
    Collider::Point((0.0, 100.0)),
    Collider::Line((0.0, 100.0), (0.0, -100.0)),
];

const WEDGE_COLLIDERS: [Collider; 6] = [
    Collider::Point((0.0, 0.0)),
    Collider::Line((0.0, 0.0), (100.0, 0.0)),
    Collider::Point((100.0, 0.0)),
    Collider::Line((100.0, 0.0), (-100.0, 100.0)),
    Collider::Point((0.0, 100.0)),
    Collider::Line((0.0, 100.0), (0.0, -100.0)),
];

const ROUNDED_CORNER_COLLIDERS: [Collider; 6] = [
    Collider::Point((0.0, 0.0)),
    Collider::Line((0.0, 0.0), (100.0, 0.0)),
    Collider::Point((100.0, 0.0)),
    Collider::Arc((0.0, 0.0), 100.0, (1.0, 0.0), (0.0, 1.0)),
    Collider::Point((0.0, 100.0)),
    Collider::Line((0.0, 100.0), (0.0, -100.0)),
];

const INVERTED_ROUNDED_CORNER_COLLIDERS: [Collider; 6] = [
    Collider::Point((0.0, 0.0)),
    Collider::Line((0.0, 0.0), (100.0, 0.0)),
    Collider::Point((100.0, 0.0)),
    Collider::Arc((100.0, 100.0), 100.0, (-1.0, 0.0), (0.0, -1.0)),
    Collider::Point((0.0, 100.0)),
    Collider::Line((0.0, 100.0), (0.0, -100.0)),
];


const CIRCLE_COLLIDERS: [Collider; 1] = [Collider::Circle((50.0, 50.0), 24.0)];

impl Collider {
    pub fn get_project_point(&self, position: &VectorF64, ball: &Point, rot: &Rotation) -> Option<Point> {
        let mid = &VectorF64::new(50.0, 50.0);
        match self {
            Collider::Point(pos) => return Some(Point::from_tuple(*pos).rotate(mid, rot).add(position)),
            Collider::Line(pos, dir) => {
                return Line::new(
                    &Point::from_tuple(*pos),
                    &Point::from_tuple(*dir),
                )
                .rotate(mid, rot)
                .add_to_pos(position)
                .project_point(ball)
            }
            Collider::Circle(pos, radius) => {
                let circle_centre = &Point::from_tuple(*pos).rotate(mid, rot).add(position);
                return Some(
                    circle_centre.add(&ball.sub(&circle_centre).get_unit().multi(*radius)),
                );
            }
            Collider::Arc(pos, radius, start, end) => { 
                return Arc::new(
                    Point::from_tuple(*pos).rotate(mid, rot).add(position),
                    *radius,
                    VectorF64::from_tuple(*start),
                    VectorF64::from_tuple(*end)
                ).project_point(ball, rot);
            }
        }
    }
}

impl GroundType {
    pub fn do_effect(&self, ball: &mut Ball, start: &Point) {
        match self {
            GroundType::Slope(rot) => ball.vel = ball.vel.add(&VectorF64::new(0.0, -1.0).rotate(&VectorF64::new(0.0, 0.0), rot)),
            GroundType::SlopeDiagonal(rot) => ball.vel = ball.vel.add(&VectorF64::new(-1.0, -1.0).rotate(&VectorF64::new(0.0, 0.0), rot)),
            GroundType::Gravel => ball.vel = ball.vel.multi(0.8),
            GroundType::GravelHeavy => ball.vel = ball.vel.multi(0.5),
            GroundType::Water => {
                ball.pos = start.clone();
                ball.vel = VectorF64::new(0.0, 0.0);
            }
            GroundType::Grass => return,
        }
    }
}

impl StructureType {
    fn get_collision_points(&self, pos: VectorF64, ball: Ball) -> Vec<Point> {
        match self {
            StructureType::Wall => self.get_points(pos, ball, &BOX_COLLIDERS),
            StructureType::Circle => self.get_points(pos, ball,  &CIRCLE_COLLIDERS),
            StructureType::Wedge(rotation) => self.get_points_rot(pos, ball, rotation, &WEDGE_COLLIDERS),
            StructureType::RoundedCorner(rotation) => self.get_points_rot(pos, ball, rotation, &ROUNDED_CORNER_COLLIDERS),
            StructureType::InvertedRoundedCorner(rotation) => self.get_points_rot(pos, ball, rotation, &INVERTED_ROUNDED_CORNER_COLLIDERS),
            StructureType::None |
            StructureType::Hole |
            StructureType::Start => Vec::<Point>::default(),
        }
    }

    fn get_special_effect_points(&self, pos: VectorF64, ball: Ball) -> Vec<(Point, StructureType)>{
        match self {
            StructureType::Hole => self.get_points(pos, ball, &CIRCLE_COLLIDERS).iter().map(|point| (*point, StructureType::Hole)).collect::<Vec<(Point, StructureType)>>(),
            _ => Vec::default(),
        }
    }

    fn get_special_effect(&self) -> Option<SpecialEffect> {
        match self {
            StructureType::Hole => Some(SpecialEffect::Hole),
            _ => None
        }
    }

    fn get_points_rot(&self, pos: Point, ball: Ball, rot: &Rotation, colliders: &[Collider]) -> Vec<Point> {
        colliders
            .iter()
            .map(|collider| collider.get_project_point(&pos, &ball.pos, rot))
            .filter(|point| point.is_some())
            .map(|point| point.unwrap())
            .collect()
    }

    fn get_points(&self, pos: Point, ball: Ball, colliders: &[Collider]) -> Vec<Point> {
        self.get_points_rot(pos,ball, &Rotation::North, colliders)
    }
}

impl GameMap {
    pub fn new() -> Self {
        Self {
            id: "123".to_string(),
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
                if x == 1 && y == 1 {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::SlopeDiagonal(Rotation::North),
                        structure_type: StructureType::Start,
                    })
                } else if x == 47 && y == 23 {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::SlopeDiagonal(Rotation::North),
                        structure_type: StructureType::Hole,
                    })
                } else if is_border {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::SlopeDiagonal(Rotation::North),
                        structure_type: StructureType::Wall,
                    })
                } else if is_middle_map {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::SlopeDiagonal(Rotation::North),
                        structure_type: StructureType::Circle,
                    })
                } else {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64 * 100.0, y as f64 * 100.0),
                        ground_type: GroundType::SlopeDiagonal(Rotation::North),
                        structure_type: StructureType::None,
                    })
                }
            }
            tiles.push(tiles_column)
        }
        return tiles;
    }

    pub fn get_start_location(&self) -> VectorF64 {
        let start_pos = self.tiles.iter().flatten().filter(|tile| matches!(tile.structure_type, StructureType::Start)).next();
        if let Some(start_pos) = start_pos {
            start_pos.pos.add(&VectorF64::new(50.0, 50.0))
        } else {
            VectorF64::new(50.0, 50.0)
        }
    }

    pub fn do_ground_effect(&self, ball: &mut Ball) {
        let x = (ball.pos.x as usize) / 100;
        let y = (ball.pos.y as usize) / 100;

        let tile = self.tiles[x][y].clone();
        tile.ground_type.do_effect(ball, &self.get_start_location())
    }

    pub fn collide(&self, ball: &mut Ball) -> Option<SpecialEffect> {
        self.do_ground_effect(ball);
        let mut d_pos = ball.vel.length();
        if d_pos < 1.0 {
            return None;
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
                
            let special_effects = close_tiles
                .iter()
                .map(|tile| tile.structure_type.get_special_effect_points(tile.pos, ball.clone()))
                .flatten()
                .collect::<Vec<_>>();
            let closest_special_effect = special_effects.iter().min_by(|a, b| {
                a.0.dist(&ball.pos)
                    .partial_cmp(&b.0.dist(&ball.pos))
                    .unwrap_or(Ordering::Equal)
            });
            
            if let Some(closest_special_effect) = closest_special_effect {
                let dist_to_closest = closest_special_effect.0.dist(&ball.pos);
                if dist_to_closest < 50.0 {
                    return closest_special_effect.1.get_special_effect();
                }
            }

            let collision_points = close_tiles
                .iter()
                .map(|tile| tile.structure_type.get_collision_points(tile.pos, ball.clone()))
                .flatten()
                .collect::<Vec<_>>();
            let closest_collision_point = collision_points.iter().min_by(|a, b| {
                a.dist(&ball.pos)
                    .partial_cmp(&b.dist(&ball.pos))
                    .unwrap_or(Ordering::Equal)
            });
            if let Some(closest_collision_point) = closest_collision_point {
                let distance_to_wall = closest_collision_point.dist(&ball.pos);
                if distance_to_wall < 50.0 {
                    println!("Seinä {:?}", closest_collision_point);
                    println!("Pallo {:?}", ball.pos);
                    self.do_collision(closest_collision_point, ball)
                }
                let to_move = d_pos.min(distance_to_wall - 49.9).max(1.0);
                ball.pos = ball.pos.add(&ball.vel.get_unit().multi(to_move));
                println!("adding some: {}/{}", to_move, ball.vel.length());

                d_pos -= to_move;
            } else {
                ball.pos = ball.pos.add(&ball.vel.get_unit().multi(d_pos));
                return None;
            }
            if d_pos < 0.0001 {
                return None;
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
