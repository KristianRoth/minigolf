use crate::{game::Player, math::{VectorF64, Line}};

pub type GameTiles = Vec<Vec<GameMapTile>>;

pub struct GameMap {
    id: u32,
    tiles: Vec<Vec<GameMapTile>>,
}


#[derive(Clone)]
pub struct GameMapTile {
    pos: VectorF64,
    ground_type: GroundType,
    structure_type: StructureType,
}

#[derive(Clone)]
pub enum GroundType {
    Grass,
    Water,
    ShallowWater,
    LightDirt,
    HeavyDirt,
}

#[derive(Clone)]
pub enum StructureType {
    Wall,
    None
}

impl Collision for StructureType {
    fn collide(&self, pos: VectorF64, ball: &mut Player) {
        match self {
            StructureType::Wall => self.box_collide(pos, ball),
            StructureType::None => return,
        }
    }
}

impl StructureType {
    fn box_collide(&self, pos: VectorF64, ball: &mut Player) {
        let circle_pos = ball.pos.clone();
        let dir_h = VectorF64::new(100.0, 0.0);
        let dir_v = VectorF64::new(0.0, 100.0);

        let line1 = Line::new(pos, dir_h);
        let line3 = Line::new(pos, dir_v);

        let line2 = Line::new(pos.add(&dir_v), dir_h);
        let line4 = Line::new(pos.add(&dir_h), dir_v);

        if let Some(projected_point) = line1.project_point(circle_pos) {
            if projected_point.dist(&circle_pos) < 50.0 {
                ball.vel.y = -ball.vel.y
            }
        }
        if let Some(projected_point) = line2.project_point(circle_pos) {
            if projected_point.dist(&circle_pos) < 50.0 {
                ball.vel.x = -ball.vel.x
            }
        }
        if let Some(projected_point) = line3.project_point(circle_pos) {
            if projected_point.dist(&circle_pos) < 50.0 {
                ball.vel.y = -ball.vel.y
            }
        }
        if let Some(projected_point) = line4.project_point(circle_pos) {
            if projected_point.dist(&circle_pos) < 50.0 {
                ball.vel.x = -ball.vel.x
            }
        }
    }
}

pub trait Collision {
    fn collide(&self, pos: VectorF64, ball: &mut Player);
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
                let is_middle_map = (x - 10).abs() <= 2 && y < 1 * 25;
                if is_border || is_middle_map {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64*100.0, y as f64 * 100.0),
                        ground_type: GroundType::Grass,
                        structure_type: StructureType::Wall,
                    })
                } else {
                    tiles_column.push(GameMapTile {
                        pos: VectorF64::new(x as f64*100.0, y as f64 * 100.0),
                        ground_type: GroundType::Grass,
                        structure_type: StructureType::None,
                    })
                }
            }
            tiles.push(tiles_column)
        }
        return tiles;
    }

    pub fn collide(&self, player: &mut Player) {
        for ele in self.tiles.clone() {
            for tile in ele {
                tile.collide(player)
            }
        }
    }
}

impl GameMapTile {
    
    pub fn collide(&self, ball: &mut Player) {
        self.structure_type.collide(self.pos, ball)
    }
}