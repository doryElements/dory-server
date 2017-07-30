const users = [{
    id: 1,
    name: "John",
    email: "john@mail.com",
    secured: {
        password: "john123",
        role: [ 'sam']
    }
}, {
    id: 2,
    name: "Sarah",
    email: "sarah@mail.com",
    secured: {
        password: "sarah123",
        role: [ 'admin', 'sam']
    }

}];
module.exports.users = users;