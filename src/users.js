// users.js
// Fake list of users to be used in the authentication
const users = [{
    id: 1,
    name: "John",
    email: "john@mail.com",
    private: {
        password: "john123"
    }
}, {
    id: 2,
    name: "Sarah",
    email: "sarah@mail.com",
    private: {
        password: "sarah123"
    }
}];

module.exports =  {
    users,
    find : function(opt ) {
        return users[0];
    },
    findOne: function ({id}) {
        const u = users.filter( item => {
            return item.id === id;
        });
        return u[0];
    },
    findByEmail: function ({email}) {
        const u = users.filter( item => {
            return item.email === email;
        });

        return u[0];
    }
};