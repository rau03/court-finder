// Re-export dbConnect from mongodb.ts to maintain compatibility
// with any files that might still be importing from this file
import dbConnect from "./mongodb";
export default dbConnect;
