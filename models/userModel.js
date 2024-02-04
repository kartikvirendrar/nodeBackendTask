const users = [
    {
        id: 1,
        phone_number: '+917727998598',
        priority: 0,
    },
    {
        id: 2,
        phone_number: '+917727998598',
        priority: 1,
    },
    {
        id: 3,
        phone_number: '+917727998598',
        priority: 2,
    },
];

const User = {
    getUserById: (id) => users.find((user) => user.id === id),
};

module.exports = User;  