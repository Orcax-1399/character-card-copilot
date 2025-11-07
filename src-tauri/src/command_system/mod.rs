pub mod builtin;
pub mod command;
pub mod registry;
pub mod tauri_commands;

pub use command::{CommandContext, CommandExecutor, CommandMetadata, CommandResult};
pub use registry::{CommandRegistry, COMMAND_REGISTRY};
