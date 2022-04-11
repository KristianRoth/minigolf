
pub struct VectorF64 {
    pub x: f64,
    pub y: f64,
}

impl VectorF64 {
    pub fn new(x: f64, y: f64) -> Self {
        VectorF64 { x: x, y: y }
    }

    pub fn length(&self) -> f64 {
        (self.x.powf(2.0) + self.y.powf(2.0)).sqrt()
    }
}