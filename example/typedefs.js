export default `
  type Query {
    users: [User]
    user(id: Int): User
  }
  type Mutation {
    insertUser(
      records: [InsertUserInput]
    ): Status
    deleteUser(
      ids: [Int]
    ): Status
    deleteInactiveUsers: Status
    updateUser(
      updates: [UpdateUserInput]
    ): Status
  }
  type User {
    id: Int
    name: String
    email: String
    age: Int
    status: String
  }
  type Status {
    insertedIds: [Int]
    deleted: Int
    changes: Int
    err: Error
  }
  type Error {
    message: String
  }
  input InsertUserInput {
    name: String!
    email: String!
    age: Int!
    status: String!
  }
  input UpdateUserInput {
    id: Int
    name: String
    email: String
    age: Int
    status: String
  }
`;
