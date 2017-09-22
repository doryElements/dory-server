const users = [
    {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        secured: {
            password: '$2a$13$UGVJHz1/x06xg4nysfqkt.aEzFFpjz6/Gy6WwFe/x3XJ/lw3gig4G',
            roles: ['sam'],
        },
    },
    {
        id: 2,
        name: 'Sarah',
        email: 'sarah@mail.com',
        secured: {
            password: '$2a$13$PGDTPJA3FTvcAqWbptZl5.PedZsq4eW3gQozPYkIAoPxv581jgtQO',
            roles: ['admin', 'sam'],
        },

    },
    {
        id: 3,
        name: 'Jerome',
        email: 'jmorille@mail.com',
        secured: {
            password: '$2a$13$hMDdGiiw4V5Rjkx4n8QZXOI7g3dIxSRfY0I2cZmScSZO1anuMqAae',
            roles: ['admin', 'sam'],
        },

    },
];
module.exports.users = users;
