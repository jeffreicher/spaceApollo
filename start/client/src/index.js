import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import Pages from './pages'
import { resolvers, typeDefs } from './resolvers'
import { Query, ApolloProvider } from 'react-apollo'
import injectStyles from './styles'
import Login from './pages/login'
import { withClientState } from 'apollo-link-state'
import { ApolloLink } from 'apollo-link'

//clint-only field
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`

const cache = new InMemoryCache()

const stateLink = withClientState({
  cache,
  resolvers: {
    Mutation: {
      updateNetworkStatus: (_, { isConnected }, { cache }) => {
        const data = {
          networkStatus: {
            __typename: 'NetworkStatus',
            isConnected
          }
        }
        cache.writeData({ data })
        return null
      }
    }
  }
})

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([
    stateLink,
    new HttpLink({
      uri: 'http://localhost:4000/graphql',
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  ]),
  initializers: {
    isLoggedIn: () => !!localStorage.getItem('token'),
    cartItems: () => []
  },
  typeDefs
})
injectStyles()

ReactDOM.render(
  <ApolloProvider client={client}>
    <Query query={IS_LOGGED_IN}>
      {({ data }) => (data.isLoggedIn ? <Pages /> : <Login />)}
    </Query>
  </ApolloProvider>,
  document.getElementById('root')
)
