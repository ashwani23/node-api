const express = require('express');
const app = express();
const cors = require('cors');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const Event = require('./models/Event')
const User = require('./models/User')

app.use(cors());

const UserController = require('./controllers/UserController');
app.use('/users', UserController);

const AuthController = require('./auth/AuthController');
app.use('/api/auth', cors(), AuthController);

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            name: String!
            email: String!
            password: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event
                .find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc }
                    })
                })
                .catch(err => { throw err; });
        },
        users: async () => {
            try {
                return await User.find().exec()
            } catch (err) {
                return err;
            }
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });

            return event
                .save()
                .then(result => {
                    console.log(result._doc);
                    return result._doc;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
        }
    },
    graphiql: true
}));

module.exports = app;