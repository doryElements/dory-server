const rules = {
    "roles": {
        "guest": {},
        "reader": {
            "permissions": ["read"],
            "inherited": ["guest"]
        },
        "writer": {
            "permissions": ["create"],
            "inherited": ["reader"]
        },
        "editor": {
            "permissions": ["update"],
            "inherited": ["reader"],
            "attributes": ["dailySchedule"]
        },
        "director": {
            "permissions": ["delete"],
            "inherited": ["reader", "editor"],
        },
        "admin": {
            "permissions": ["manage", "admin2"],
            "inherited": ["director"]
        }
    },
    "users": {
    "john.smith": ["writer"],
        "Sarah": ["admin"]
}

};

module.exports = rules;