const users = [{
    id: 1,
    name: "John",
    email: "john@mail.com",
    secured: {
        password: "john123",
        roles: [ 'sam']
    }
}, {
    id: 2,
    name: "Sarah",
    email: "sarah@mail.com",
    secured: {
        password: "sarah123",
        roles: [ 'admin', 'sam']
    }

}];
module.exports.users = users;