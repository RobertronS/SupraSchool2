import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://supraschool.online/api',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = process.browser && localStorage.getItem('__jwt');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const GET_USER = gql`
  query {
    me {
      id
      firstName
      secondName
      email
      isConfirmed
      phoneNumber
      password
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      id
      firstName
      token
      isConfirmed
    }
  }
`;

export const REGISTER = gql`
  mutation register(
    $firstName: String!
    $secondName: String!
    $email: String!
    $phoneNumber: String!
    $password: String!
  ) {
    register(
      input: {
        firstName: $firstName
        secondName: $secondName
        email: $email
        phoneNumber: $phoneNumber
        password: $password
      }
    ) {
      id
      email
    }
  }
`;

export const CONFIRM = gql`
  mutation confirm($id: Int!, $token: String!) {
    confirm(input: { id: $id, token: $token }) {
      id
      email
    }
  }
`;