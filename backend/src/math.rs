use serde::{Serialize, Deserialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct VectorF64 {
    pub x: f64,
    pub y: f64,
}

impl PartialEq for VectorF64 {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

impl VectorF64 {
    pub fn new(x: f64, y: f64) -> Self {
        VectorF64 { x: x, y: y }
    }
    pub fn from_tuple(pos: (f64, f64)) -> Self {
        VectorF64 { x: pos.0, y: pos.1 }
    }

    pub fn add(&self, b: &VectorF64) -> VectorF64 {
        VectorF64::new(self.x + b.x, self.y + b.y)
    }

    pub fn sub(&self, b: &VectorF64) -> VectorF64 {
        VectorF64::new(self.x - b.x, self.y - b.y)
    }

    pub fn length(&self) -> f64 {
        (self.x.powf(2.0) + self.y.powf(2.0)).sqrt()
    }

    pub fn dot_product(&self, b: &VectorF64) -> f64 {
        self.x * b.x + self.y * b.y
    }

    pub fn get_normal(&self) -> VectorF64 {
        VectorF64::new(-self.y, self.x)
    }

    pub fn get_unit(&self) -> VectorF64 {
        self.multi(1.0/self.length())
    }

    pub fn multi(&self, multi: f64) -> VectorF64 {
        VectorF64::new(self.x * multi, self.y * multi)
    }

    pub fn project(&self, b: &VectorF64) -> VectorF64 {
        let dot = self.dot_product(b);
        let unit_fac = dot / self.dot_product(self);
        self.multi(unit_fac)
    }

    pub fn dist(&self, b: &VectorF64) -> f64 {
        self.sub(b).length()
    }

    pub fn change_to_normal_base(&self, new_base: &VectorF64) -> VectorF64 {
        let normal = new_base.get_normal();
        // | new_base.x, normal.x | x | self.x | = | new_base.x*self.x + normal.x*self.y |
        // | new_base.y, normal.y |   | self.y |   | new_base.y*self.x + normal.y*self.y |
        VectorF64 { 
            x: new_base.x*self.x + normal.x*self.y,
            y: new_base.y*self.x + normal.y*self.y
        }
    }

    pub fn change_base(&self, new_base: &VectorF64) -> VectorF64 {
        let normal = new_base.get_normal();
        let scale = 1.0/(normal.y*new_base.x - normal.x*new_base.y);
        let new_base = new_base.multi(scale);
        let normal = normal.multi(scale);
        // |    normal.y,  -normal.x | x | self.x | = | new_base.x*self.x + normal.x*self.y |
        // | -new_base.y, new_base.x |   | self.y |   | new_base.y*self.x + normal.y*self.y |
        //                .multi(1/(normal.y*new_base.x - normal.x*new_base.y))
        VectorF64 { 
            x:    normal.y*self.x   - normal.x*self.y,
            y: -new_base.y*self.x + new_base.x*self.y,
        }
    
    }
}

#[derive(Clone, Copy)]
pub struct Line {
    pos: VectorF64,
    dir: VectorF64,
}

impl Line {
    pub fn new(pos: &VectorF64, dir: &VectorF64) -> Self {
        Self { pos: *pos, dir: *dir }
    }

    pub fn from_tuple(pos: (f64, f64), dir: (f64, f64)) -> Self {
        Self {
            pos: VectorF64::from_tuple(pos),
            dir: VectorF64::from_tuple(dir),
        }
    }

    pub fn project_point(&self, point: &VectorF64) -> Option<VectorF64> {
        let translated_point = point.sub(&self.pos);
        let projected_vec = self.dir.project(&translated_point);

        if projected_vec.dot_product(&self.dir) > 0.0 && projected_vec.length() < self.dir.length() {
            return Some(projected_vec.add(&self.pos));
        }
        None
    }
}

#[cfg(test)]
mod tests {
    use super::{Line, VectorF64};

    // add
    #[test]
    fn test_add() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).add(&VectorF64::new(2.0, 3.0)),
            VectorF64::new(3.0, 5.0)
        );
    }
    // sub
    #[test]
    fn test_sub() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).sub(&VectorF64::new(2.0, 3.0)),
            VectorF64::new(-1.0, -1.0)
        );
    }
    // length
    #[test]
    fn test_length() {
        assert_eq!(VectorF64::new(1.0, 1.0).length(), 2.0f64.sqrt());
    }
    // dot_product
    #[test]
    fn test_dot_product() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).dot_product(&VectorF64::new(2.0, 3.0)),
            8.0
        );
    }
    // get_normal
    #[test]
    fn test_get_normal() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).get_normal(),
            VectorF64::new(-2.0, 1.0)
        );
    }

    #[test]
    fn test_unit() {
        assert_eq!(VectorF64::new(1023.1223, 123.00).get_unit().multi(40.0).length(), 40.0)
    }
    // multi
    #[test]
    fn test_multi() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).multi(2.0),
            VectorF64::new(2.0, 4.0)
        );
    }
    // project
    #[test]
    fn test_project() {
        assert_eq!(
            VectorF64::new(1.0, 0.0).project(&VectorF64::new(0.5, 1.0)),
            VectorF64::new(0.5, 0.0)
        );
    }

    // dist
    #[test]
    fn test_dist() {
        assert_eq!(
            VectorF64::new(1.0, 2.0).dist(&VectorF64::new(2.0, 3.0)),
            2.0f64.sqrt()
        );
    }

    // project_point
    #[test]
    fn test_project_point() {
        assert_eq!(
            Line::new(&VectorF64::new(0.0, 0.0), &VectorF64::new(1.0, 0.0))
                .project_point(&VectorF64::new(0.5, 1.0)),
            Some(VectorF64::new(0.5, 0.0))
        );
        assert_eq!(
            Line::new(&VectorF64::new(0.0, 0.0), &VectorF64::new(1.0, 1.0))
                .project_point(&VectorF64::new(0.5, 1.0)),
            Some(VectorF64::new(0.75, 0.75))
        )
    }

    #[test]
    fn test_change_basis() {
        let basis = VectorF64::new(1.0, 1.0);
        println!("{:?}", VectorF64::new(1.0, 0.0).change_base(&basis));
        assert_eq!(VectorF64::new(123.0, 1.0).change_base(&basis).change_to_normal_base(&basis), VectorF64::new(123.0, 1.0));

    }
}
