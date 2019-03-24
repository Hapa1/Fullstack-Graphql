const graphql = require('graphql');
const _ = require('lodash');
const Book = require('./models/book');
const Author = require('./models/author')

const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull //ensures values arent null
} = graphql //es6 destructuring

var books = [
    { name: "LOTR", genre: "Fantasy", id:'1', authorId: '1'},
    { name: "Warcraft", genre: "Fantasy", id:'2', authorId: '1'},
    { name: "Final Fantasy", genre: "Fantasy", id:'3', authorId: '1'}
];

var authors = [
    { name: "Ryan", age: 12, id:'1'}
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({ //fields is a function because AuthorType is not defined, thus an error would be thrown
        id: { type: GraphQLString}, //needs special graphql string!!!
        name: { type: GraphQLString},
        genre: { type: GraphQLString},
        author: {
            type: AuthorType,
            resolve(parent, args){  //responsible for looking at data and returning what is needed
                //return _.find(authors, {id: parent.authorId}) //parent is the book we are querying 
                return Author.findById(parent.authorId)
               
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({ 
        id: { type: GraphQLString}, //needs special graphql string!!!
        name: { type: GraphQLString},
        age: { type: GraphQLInt},
        books: {
            type: new GraphQLList(BookType), //LIST OF BOOKTYPES{ name: "LOTR", genre: "Fantasy", id:'1', authorId: '1'}
            resolve(parent, args){
                //return _.filter(books, {authorId: parent.id}) 
                return Book.find({
                    authordId: parent.id
                });
            }
        }
    })
});




const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType, //type of data we are looking for 
            args: {id: { type: GraphQLID }}, //pass argument for certain book 
            resolve(parent, args){ //code to get data from db
                //return _.find(books, {id: args.id })
                return Book.findById(args.id)
            }
        },
        author: {
            type: AuthorType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args){ //code to get data from db
                //return _.find(authors, {id: args.id }) //_.find using lodash 
                return Author.findById(args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent,args){
                //return books
                return Book.find({})
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent,args){
                //return authors
                return Author.find({})
            }
        }
    }
});

const Mutation = new GraphQLObjectType({ //Create and update 
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve(parent, args){//store in database 
                let author = new Author({ //Mongoose author
                    name: args.name,
                    age: args.age
                });
                return  author.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent,args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        }
    }
});

module.exports = new GraphQLSchema({ 
    query: RootQuery, //determine which query users can use from frontend 
    mutation: Mutation
})

