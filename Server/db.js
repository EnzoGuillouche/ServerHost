class User {
    constructor(name, pword) {
        this.username = name
        this.password = pword
    }
}

export let users = [
    new User("Enzo", "MyPassword"),
];

export let sessions = {};
