export default `
  type Query {
    users: [User]
    user(id: Int): User
    megastate: MegaState
  }
  type Mutation {
    insertUser(
      body: [InsertUserInput]
    ): Status
    deleteUser(
      ids: [Int]
    ): Status
    updateUser(
      body: [UpdateUserInput]
    ): Status
  }
  type MegaState {
    Users: [User],
    Products: [Product],
  }
  type User {
    id: Int
    name: String
    email: String
  }
  type Product {
    id: Int
    categoryId: Int
    name: String
    description: String
    price: Float
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
  }
  input UpdateUserInput {
    id: Int!
    name: String
    email: String
  }
`;