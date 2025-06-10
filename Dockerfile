# Use the official Rust image as the base image
FROM rust:latest

# Set the working directory
WORKDIR /app

# Copy the project files into the Docker image
COPY . .

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install latest
RUN avm use latest

# Update proc-macro2 to a compatible version
RUN cargo update -p proc-macro2 --precise 1.0.56

# Build the project
CMD ["anchor", "build"] 