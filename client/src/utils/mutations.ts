import { gql } from "@apollo/client";

// Define a fragment for the user data to avoid redundancy
export const USER_FRAGMENT = gql`
  fragment UserData on User {
    _id
    username
    email
  }
`;

// Login Mutation
export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ...UserData
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Add User Mutation
export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        ...UserData
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Save Book Mutation
export const SAVE_BOOK = gql`
  mutation SaveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      title
      authors
      description
      image
      bookId
    }
  }
`;

// Remove Book Mutation
export const REMOVE_BOOK = gql`
  mutation RemoveBook($bookId: ID!) {
    removeBook(bookId: $bookId) {
      _id
      title
      authors
    }
  }
`;
