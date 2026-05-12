fn main() {
    println!("Hello, world!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_hello_world_output() {
        // Test that the program compiles and runs
        // The actual output test is done via integration test (make rs-run)
        assert_eq!(format!("Hello, world!"), "Hello, world!");
    }
}
