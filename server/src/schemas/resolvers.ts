import User, { UserDocument } from "../models/User.js";
import { AuthenticationError } from "../services/auth.js";
import { signToken } from "../services/auth.js";

interface MongoDbError extends Error {
  code?: number;
  keyPattern?: Record<string, any>;
}

const resolvers = {
  Query: {
    // Resolving the 'me' query to return the currently logged-in user
    me: async (_parent: any, _args: any, context: any): Promise<UserDocument | null> => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in");
    },

    // Resolving the 'getUser' query to get a user by username
    getUser: async (_parent: any, { username }: { username: string }): Promise<UserDocument | null> => {
      return User.findOne({ username }).populate("savedBooks");
    },
  },

  Mutation: {
    // Mutation for logging in
    login: async (_parent: any, { email, password }: { email: string; password: string }): Promise<{ token: string; user: UserDocument } | null> => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Mutation for registering a new user
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }): Promise<{ token: string; user: UserDocument } | null> => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email }, { username }],
        });

        if (existingUser) {
          throw new AuthenticationError(
            existingUser.email === email
              ? "This email is already registered. Please login instead."
              : "This username is already taken."
          );
        }

        const user = await User.create({ username, email, password });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (error: unknown) {
        // Type guard for MongoDB duplicate key error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          (error as MongoDbError).code === 11000
        ) {
          const mongoError = error as MongoDbError;
          if (mongoError.keyPattern) {
            const field = Object.keys(mongoError.keyPattern)[0];
            throw new AuthenticationError(
              `This ${field} is already registered. Please try another ${field}.`
            );
          }
        }

        // Log the original error but throw a user-friendly message
        console.error("User creation error:", error);
        throw new AuthenticationError(
          "Failed to create user account. Please try again."
        );
      }
    },

    // Mutation for saving a book to the user's savedBooks
    saveBook: async (_parent: any, { bookData }: { bookData: any }, context: any): Promise<UserDocument | null> => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    // Mutation for removing a book from the user's savedBooks
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any): Promise<UserDocument | null> => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

export default resolvers;
